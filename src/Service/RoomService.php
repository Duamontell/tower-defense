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
        private RoomRepository $roomRepository,
        private RoomPlayerRepository $roomPlayerRepository,
        private MercureService $mercureService
    ) {}

    public function createRoom(User $host): int
    {
        $room = new Room(null, 0, new \DateTime());
        $roomId = $this->roomRepository->store($room);
        $this->addPlayerToRoom($host, $roomId);

        return $roomId;
    }

    public function addPlayerToRoom(User $player, int $roomId): int
    {
        if (!$room = $this->roomRepository->find($roomId)) {
            // TODO: Переделать?
            throw new \RuntimeException("Комната с ID {$roomId} не найдена!");
        }

//        if ($this->userAlreadyInRoom($player->getId(), $roomId)) {
//            throw new \RuntimeException("User is already in room");
//        }

        // TODO: Возможно стоит убрать, так как есть проверка свободных слотов дальше
        if ($this->roomPlayerRepository->countPlayersInRoom($room) === 4) {
            throw new \RuntimeException("Комната с ID {$roomId} полная!");
        }

        $freeSlots = $this->getFreeSlots($room);
        $roomPlayer = new RoomPlayer(null, $room, $player, $freeSlots[0], false);

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

    private function userAlreadyInRoom($userId, $roomId): bool
    {
        // TODO: Сделать проверкку пользователя в комнате
        return false;
    }


}
