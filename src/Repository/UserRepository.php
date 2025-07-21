<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function store(User $user): int
    {
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
        return $user->getId();
    }

    public function findById(int $id): ?User
    {
        return $this->getEntityManager()->getRepository(User::class)->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->getEntityManager()->getRepository(User::class)->findOneBy(array('email' => $email));
    }

    public function delete(User $user): void
    {
        $this->getEntityManager()->remove($user);
        $this->getEntityManager()->flush();
    }
}
