<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Room;
use App\Entity\RoomPlayer;
use App\Entity\User;
use App\Repository\RoomPlayerRepository;
use App\Repository\RoomRepository;

class RoomService
{
    public function __construct(
        private RoomRepository       $roomRepository,
        private RoomPlayerRepository $roomPlayerRepository,
        private MercureService       $mercureService
    )
    {
    }

    public function createRoom(User $host): int
    {
        $room = new Room(null, 0, new \DateTime());
        $roomId = $this->roomRepository->store($room);
        $this->addPlayerToRoom($host, $roomId);

        $this->mercureService->publish(
            topic: "/room-list",
            data: [
                'action' => 'createRoom',
                'roomId' => $roomId,
            ],
        );

        return $roomId;
    }

    public function addPlayerToRoom(User $player, int $roomId): int
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            // TODO: Переделать?
            throw new \RuntimeException("Комната с номером {$roomId} не найдена!");
        }

        if ($roomPlayer = $this->userAlreadyInRoom($player->getId(), $roomId)) {
            return $roomPlayer->getId();
        }

        $freeSlots = $this->getFreeSlots($room);
        if (empty($freeSlots)) {
            throw new \RuntimeException("Комната с номером {$roomId} полная!");
        }

        $roomPlayer = new RoomPlayer(null, $room, $player, $freeSlots[0], false, false);

        $this->mercureService->publish(
            topic: "/room/{$roomId}",
            data: [
                'action' => 'playerJoin',
                'id' => $player->getId(),
                'name' => $player->getName(),
                'slot' => $roomPlayer->getSlot(),
                'isReady' => $roomPlayer->isReady(),
            ],
        );

        return $this->roomPlayerRepository->store($roomPlayer);
    }

    public function getFreeSlots(Room $room): array
    {
        $allSlots = [1, 2, 3, 4];
        $occupiedSlots = [];

        foreach ($room->getPlayers() as $player) {
            $occupiedSlots[] = $player->getSlot(); // Собираем занятые слоты
        }

        return array_values(array_diff($allSlots, $occupiedSlots)); // Возвращаем свободные слоты
    }

    public function allPlayerReady(int $roomId): void
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            throw new \RuntimeException("Комната с ID {$roomId} не найдена!");
        }

        if ($this->checkAllPlayerReady($room)) {
            $this->mercureService->publish(
                topic: "/room/{$roomId}",
                data: [
                    'action' => 'allReady'
                ],
            );
        } else {
            $this->mercureService->publish(
                topic: "/room/{$roomId}",
                data: [
                    'action' => 'cancel'
                ]
            );
        }
    }

    private function checkAllPlayerReady(Room $room): bool
    {
        foreach ($room->getPlayers() as $playerInRoom) {
            if (!$playerInRoom->isReady()) {
                return false;
            }
        }

        return true;
    }

    private function userAlreadyInRoom(int $userId, int $roomId): ?RoomPlayer
    {
        return $this->roomPlayerRepository->findOneByPlayerAndRoom($userId, $roomId);
    }

    public function changeRoomStatus(int $roomId, int $roomStatus): void
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            throw new \RuntimeException("Комната с ID {$roomId} не найдена!");
        }

        $room->setStatus($roomStatus);
        $this->roomRepository->store($room);
    }

    public function leaveRoom(User $user, int $roomId): void
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            throw new \RuntimeException("Комнаты под номером $roomId не существует");
        }

        $players = $room->getPlayers();
        $playerFinded = false;
        foreach ($players as $player) {
            if ($player->getPlayer() === $user) {
                $this->roomPlayerRepository->delete($player);
                $players->removeElement($player);
                $playerFinded = true;

                if ($players->count() === 0) {
                    $this->deleteRoom($room->getId());
                } else {
                    $this->mercureService->publish(
                        topic: "/room/{$roomId}",
                        data: [
                            'action' => 'leaveRoom',
                            'playerId' => $user->getId(),
                        ]
                    );
                }

                break;
            }
        }

        if (!$playerFinded) {
            throw new \RuntimeException("{$user->getName()} нет в этой комнате!");
        }

    }

    public function deleteRoom(int $roomId): void
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            throw new \RuntimeException("Удаляемая комната под номером $roomId не найдена");
        }

        $this->roomRepository->delete($room);
        $this->mercureService->publish(
            topic: "/room-list",
            data: [
                'action' => 'deleteRoom',
                'roomId' => $roomId
            ]
        );
    }

    public function isRoomPlayer(?User $user, $roomId): bool
    {
        $room = $this->roomRepository->find($roomId);
        foreach ($room->getPlayers() as $player) {
            if ($player->getPlayer() === $user) {
                return true;
            }
        }
        return false;
    }

    public function grabPlayerInGameStatuses(int $roomId)
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            throw new \RuntimeException("Комнаты под номером $roomId не существует");
        }

        $players = $room->getPlayers();
        $playerStatuses = [];
        foreach ($players as $player) {
            $playerStatuses[] = [
                'id' => $player->getPlayer()->getId(),
                'isReady' => $player->isReadyInGame()
            ];
        }
        return $playerStatuses;
    }

}
