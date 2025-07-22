<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Room;
use App\Repository\RoomRepository;
use App\Repository\UserRepository;
use App\Service\MercureService;
use App\Service\RoomService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private RoomRepository $roomRepository,
        private RoomService $roomService
    ) {}

    public function roomList(MercureService $mercureService): Response
    {
        $openRooms = $this->roomRepository->findRoomsByStatus(Room::STATUS_WAITING);

        return $this->render('room/room_list.html.twig', [
            'openRooms' => $openRooms,
            'mercureUrl' => $mercureService->getMercureUrl(),
        ]);
    }

    public function showRoom($roomId) : Response
    {
        $room = $this->roomRepository->findById((int)$roomId);
        $players = $room->getPlayers();

        return $this->render('room/room.html.twig', [
            'room' => $room,
            'players' => $players,
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
}
