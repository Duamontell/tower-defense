<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Room;
use App\Repository\RoomRepository;
use App\Service\MercureService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class RoomController extends AbstractController
{
    public function __construct(
        private RoomRepository $roomRepository,
    ) {}

    public function roomList(MercureService $mercureService): Response
    {
        $openRooms = $this->roomRepository->findRoomsByStatus(Room::STATUS_WAITING);

        return $this->render('room/room_list.html.twig', [
            'openRooms' => $openRooms,
            'mercureUrl' => $mercureService->getMercureUrl(),
        ]);
    }
}
