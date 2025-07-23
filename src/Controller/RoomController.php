<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Room;
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
        private UserRepository $userRepository,
        private RoomRepository $roomRepository,
        private RoomService $roomService,
        private RoomPlayerService $roomPlayerService,
        private MercureService $mercureService
    ) {}

    public function roomList(): Response
    {
        $openRooms = $this->roomRepository->findRoomsByStatus(Room::STATUS_WAITING);

        return $this->render('room/room_list.html.twig', [
            'openRooms' => $openRooms,
            'mercureUrl' => $this->mercureService->getMercureUrl(),
        ]);
    }

    public function showRoom($roomId) : Response
    {
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());

        $room = $this->roomRepository->findById((int)$roomId);
        $players = $room->getPlayers();

        return $this->render('room/room.html.twig', [
            'room' => $room,
            'userId' => $user->getId(),
            'players' => $players,
            'mercureUrl' => $this->mercureService->getMercureUrl(),
        ]);
    }

    public function createRoom() :Response
    {
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());
        $roomId = $this->roomService->createRoom($user);

        return $this->redirectToRoute('show_room', ['roomId' => $roomId]);
    }

    public function joinToRoom(int $roomId): Response
    {
        if (!$securityUser = $this->getUser()) {
            return $this->redirectToRoute('login');
        }

        $user = $this->userRepository->findByEmail($securityUser->getUserIdentifier());
        $this->roomService->addPlayerToRoom($user, $roomId);

        return $this->redirectToRoute('show_room', ['roomId' => $roomId]);
    }

    public function playerChangeReady(int $roomId, Request $request) :JsonResponse
    {
        if (!$this->getUser()) {
//            TODO: Добавить проверку на пользователя
        }

        $data = json_decode($request->getContent(), true);
        $playerId = (int) $data['playerId'];
        $ready = $data['ready'];

        $this->roomPlayerService->setReady($playerId, $roomId, $ready);

        return $this->json(['playerId' => $playerId, 'isReady' => $ready], Response::HTTP_OK);
    }

    public function checkAllReady(int $roomId) :JsonResponse
    {
        if (!$this->getUser()) {
            //  TODO: Добавить проверку на пользователя
        }

        $this->roomService->allPlayerReady($roomId);

        return $this->json(['allReady' => true], Response::HTTP_OK);
    }

    public function changeRoomStatus(Request $request) :JsonResponse
    {
        if (!$this->getUser()) {
            return $this->json(['error' => 'Вы не авторизованы'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $roomId = (int) $data['roomId'];
        $roomStatus = (int) $data['status'];
        $this->roomService->changeRoomStatus($roomId, $roomStatus);

        return $this->json(['success' => true], Response::HTTP_OK);
    }
}
