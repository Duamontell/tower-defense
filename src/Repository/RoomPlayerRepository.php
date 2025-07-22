<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Room;
use App\Entity\RoomPlayer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RoomPlayerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RoomPlayer::class);
    }

    public function store(RoomPlayer $roomPlayer): int
    {
        $this->getEntityManager()->persist($roomPlayer);
        $this->getEntityManager()->flush();
        return $roomPlayer->getId();
    }

    public function countPlayersInRoom(Room $room) : int
    {
        return $this->count(['room' => $room]);
    }
}
