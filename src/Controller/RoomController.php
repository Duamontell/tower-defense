<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Room;
use App\Repository\RoomPlayerRepository;
use App\Repository\RoomRepository;
use App\Repository\UserRepository;
use App\Service\MercureService;
use App\Service\RoomPlayerService;
use App\Service\RoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends AbstractController
{
    public function __construct(
        private UserRepository       $userRepository,
        private RoomRepository       $roomRepository,
        private RoomPlayerRepository $roomPlayerRepository,
        private RoomService          $roomService,
        private RoomPlayerService    $roomPlayerService,
        private MercureService       $mercureService
    ) {}

    public function roomList(): Response
    {
        $openRooms = $this->roomRepository->findRoomsByStatus(Room::STATUS_WAITING);

        return $this->render('room/room_list.html.twig', [
            'openRooms' => $openRooms,
            'mercureUrl' => $this->mercureService->getMercureUrl(),
        ]);
    }

    public function showRoom($roomId): Response
    {
//        TODO: Переделать условия?
        $securityUser = $this->getUser();
        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());

        if (!$room = $this->roomRepository->findById((int)$roomId)) {
            $this->addFlash('error', 'Комната с номером ' . $roomId . ' не найдена');
            return $this->redirectToRoute('room_list');
        }

        if ($room->getStatus() !== Room::STATUS_WAITING) {
            $this->addFlash('error', 'Игра в комнате уже идёт!');
            return $this->redirectToRoute('room_list');
        }

        if (!$this->roomService->isRoomPlayer($user, $roomId)) {
            $this->addFlash('error', 'Вы не можете просматривать эту комнату!');
            return $this->redirectToRoute('room_list');
        }

        $players = $room->getPlayers();

        return $this->render('room/room.html.twig', [
            'room' => $room,
            'userId' => $user->getId(),
            'players' => $players,
            'mercureUrl' => $this->mercureService->getMercureUrl(),
        ]);
    }

    public function createRoom(): Response
    {
        $securityUser = $this->getUser();
        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());
        if ($userRoom = $this->roomRepository->findByIdAndStatusAndPlayer($user->getId(), ROOM::STATUS_WAITING)) {
            $leaveUrl = $this->generateUrl('room_leave', ['roomId' => $userRoom->getId()]);
            $this->addFlash(
                'warning',
                sprintf(
                    'Вы уже находитесь в комнате %d. <a href="%s">Выйти из неё?</a>',
                    $userRoom->getId(),
                    $leaveUrl
                )
            );
            return $this->redirectToRoute('room_list');
        }
        $roomId = $this->roomService->createRoom($user);

        return $this->redirectToRoute('show_room', ['roomId' => $roomId]);
    }

    public function joinToRoom(int $roomId): Response
    {
        $securityUser = $this->getUser();
        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());
        if ($userRoom = $this->roomRepository->findByIdAndStatusAndPlayer($user->getId(), ROOM::STATUS_WAITING)) {
            if ($userRoom->getId() !== $roomId) {
                $leaveUrl = $this->generateUrl('room_leave', ['roomId' => $userRoom->getId()]);
                $this->addFlash(
                    'warning',
                    sprintf(
                        'Вы уже находитесь в комнате %d. <a href="%s">Выйти из неё?</a>',
                        $userRoom->getId(),
                        $leaveUrl
                    )
                );
                return $this->redirectToRoute('room_list');
            }
        }

        try {
            $this->roomService->addPlayerToRoom($user, $roomId);
        } catch (\RuntimeException $e) {
            $this->addFlash('error', $e->getMessage());
            return $this->redirectToRoute('room_list');
        }

        return $this->redirectToRoute('show_room', ['roomId' => $roomId]);
    }

    public function leaveRoom(int $roomId): Response
    {
        $securityUser = $this->getUser();
        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());

        try {
            $this->roomService->leaveRoom($user, $roomId);
        } catch (\RuntimeException $e) {
            $this->addFlash('error', $e->getMessage());
            return $this->redirectToRoute('room_list');
        }

        $this->addFlash('success', 'Вы вышли из комнаты ' . $roomId);

        return $this->redirectToRoute('room_list');
    }

    public function playerChangeReady(int $roomId, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $playerId = (int)$data['playerId'];
        $ready = $data['ready'];

        $this->roomPlayerService->setReady($playerId, $roomId, $ready);

        return $this->json(['playerId' => $playerId, 'isReady' => $ready], Response::HTTP_OK);
    }

    public function checkAllReady(int $roomId): JsonResponse
    {
        $this->roomService->allPlayerReady($roomId);

        return $this->json(['allReady' => true], Response::HTTP_OK);
    }

    public function changeRoomStatus(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $roomId = (int)$data['roomId'];
        $roomStatus = (int)$data['status'];
        $this->roomService->changeRoomStatus($roomId, $roomStatus);

        return $this->json(['success' => true], Response::HTTP_OK);
    }
}
