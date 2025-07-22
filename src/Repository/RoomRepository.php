<?php

namespace App\Repository;

use App\Entity\Room;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RoomRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Room::class);
    }

    public function store(Room $room) :int
    {
        $this->getEntityManager()->persist($room);
        $this->getEntityManager()->flush();
        return $room->getId();
    }

    public function findById(int $id): ?Room
    {
        return $this->getEntityManager()->getRepository(Room::class)->find($id);
    }

    public function findByCode(string $code): ?Room
    {
        return $this->getEntityManager()->getRepository(Room::class)->findOneBy(['code' => $code]);
    }

    public function findRoomsByStatus(int $status): array
    {
        return $this->findBy(['status' => $status]);
    }
}
