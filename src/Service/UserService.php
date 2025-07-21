<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;

class UserService
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
    ) {}

    public function saveUser(array $userInfo) : User
    {
        if (!$this->checkRequiredFilds($userInfo)) {
            throw new \RuntimeException("Обязательные поля должны быть заполнены и не превышать лимит символов!");
        }

        if ($this->existsByEmail($userInfo['email'])) {
            throw new \RuntimeException("Такой пользователь уже есть");
        }

        $userInfo['password'] = $this->passwordHasher->hash($userInfo['password']);
        $user = new User(null, $userInfo['email'], $userInfo['password']);
        $id = $this->userRepository->store($user);
        return $this->userRepository->findById($id);
    }

    public function existsByEmail(string $email): bool
    {
        return null !== $this->userRepository->findByEmail($email);
    }

    private function checkRequiredFilds(array $userInfo) : bool
    {
        if (empty($userInfo['email']) || empty($userInfo['password'])) {
            return false;
        }

        return strlen($userInfo['email']) <= 255
            && strlen($userInfo['password']) <= 255;
    }
}
