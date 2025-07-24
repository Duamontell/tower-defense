<?php

declare(strict_types=1);

namespace App\Repository;

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

    public function findOneByPlayerAndRoom(int $playerId, int $roomId): ?RoomPlayer
    {
        return $this->findOneBy(['player' => $playerId, 'room' => $roomId]);
    }

    public function findByPlayerAndStatus(int $playerId, int $status): ?RoomPlayer
    {
        return $this->findOneBy(['player' => $playerId, 'status' => $status]);
    }

//    public function countPlayersInRoom(Room $room) : int
//    {
//        return $this->count(['room' => $room]);
//    }

    public function delete(RoomPlayer $roomPlayer): void
    {
        $this->getEntityManager()->remove($roomPlayer);
        $this->getEntityManager()->flush();
    }
}
