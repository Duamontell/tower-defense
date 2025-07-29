<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\RoomRepository;
use App\Repository\UserRepository;
use App\Service\RoomPlayerService;
use App\Service\RoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class GameController extends AbstractController
{
    public function __construct(
        private RoomRepository $roomRepository,
        private UserRepository $userRepository, private readonly RoomService $roomService, private readonly RoomPlayerService $roomPlayerService
    ) {
    }

    public function menu(): Response
    {
        return $this->render('menu/main-menu.html.twig');
    }

    public function selectLevel(): Response
    {
        return $this->render('menu/select-level.html.twig');
    }

    public function gameRules(): Response
    {
        return $this->render('game/game-rules.html.twig');
    }

    public function singleplayer(Request $request): Response
    {
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }
        $level = (int) $request->get('level');

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());


        return $this->render('game/game.html.twig', [
            'level' => $level,
            'userId' => $user->getId(),
            'gamemode' => 'singleplayer',
        ]);
    }

    public function game(int $roomId): Response
    {
        //      Можно сделать подписку(topic) на имя комнаты: topic=/game/room=$roomId
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());

        $room = $this->roomRepository->findById($roomId);
        $players = $room->getPlayers();
        $playerData = [];
        foreach ($players as $player) {
            $playerData[] = [
                'userId' => $player->getPlayer()->getId(),
                'config' => $player->getSlot(),
            ];
        }

        return $this->render('game/game.html.twig', [
            'userId' => $user->getId(),
            'gamemode' => 'multiplayer',
            'roomId' => $roomId,
            'roomConfig' => [
                'players' => $playerData,
            ],
        ]);
    }

    public function playerReady(int $roomId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $playerId = (int)$data['playerId'];
        $ready = $data['isReady'];
        $this->roomPlayerService->setReadyInGame($playerId, $roomId, $ready);

        return $this->json(['success' => true]);
    }

    public function grabPlayerInGameStatuses(int $roomId): JsonResponse
    {
        $playerStatuses = $this->roomService->grabPlayerInGameStatuses($roomId);
        return $this->json($playerStatuses, Response::HTTP_OK);
    }
}
