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
        if ($level > 2) {
            return $this->redirectToRoute('select-level');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());


        return $this->render('game/game.html.twig', [
            'level' => $level,
            'userId' => $user->getId(),
            'gamemode' => 'singleplayer',
        ]);
    }

    public function game(int $roomId): Response
    {
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());

        $room = $this->roomRepository->findById($roomId);
        $players = $room->getPlayers();
        $playerData = [];
        $isPlayerRoom = false;
        foreach ($players as $player) {
            if ($player->getPlayer()->getId() === $user->getId()) {
//                if ($player->isReadyInGame() === true) {
//                    $this->addFlash('error', 'Игра уже началась, переподключение невозможно');
//                    return $this->redirectToRoute('room_list');
//                }
                $isPlayerRoom = true;
            }
            $playerData[] = [
                'userId' => $player->getPlayer()->getId(),
                'config' => $player->getSlot(),
            ];
        }

        if (!$isPlayerRoom) {
            $this->addFlash('error', 'Вы не участник игры');
            return $this->redirectToRoute('room_list');
        }

        return $this->render('game/game.html.twig', [
            'topic' => "/game/room/$roomId",
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
