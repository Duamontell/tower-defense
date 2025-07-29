<?php

declare(strict_types=1);

namespace App\Service;

use App\Repository\RoomPlayerRepository;

class RoomPlayerService
{
    public function __construct(
        private RoomPlayerRepository $roomPlayerRepository,
        private MercureService $mercureService
    ) {}

//    TODO: Полностью переделать готовность пользователя для игры
    public function setReady(int $playerId, int $roomId, bool $ready): void
    {
        if (!$entry = $this->roomPlayerRepository->findOneByPlayerAndRoom($playerId, $roomId)) {
            throw new \RuntimeException("Игрок не в комнате");
        }

        $entry->setIsReady($ready);
        $this->roomPlayerRepository->store($entry);

        // Возможно не надо!
        $this->mercureService->publish(
            topic: "/room/{$roomId}",
            data: [
                'action' => 'ready',
                'player' => [
                    'id'      => $entry->getPlayer()->getId(),
                    'isReady' => $ready,
                ],
            ],
        );
    }

    public function setReadyInGame(int $playerId, int $roomId, bool $ready): void
    {
        if (!$entry = $this->roomPlayerRepository->findOneByPlayerAndRoom($playerId, $roomId)) {
            throw new \RuntimeException("Игрок не в комнате");
        }

        $entry->setIsReadyInGame($ready);
        $this->roomPlayerRepository->store($entry);

        $this->mercureService->publish(
            topic: "/game/room/{$roomId}/ready",
            data: [
                'id' => $entry->getPlayer()->getId(),
                'isReady' => $ready,
            ]
        );
    }
}
