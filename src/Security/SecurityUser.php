<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class SecurityUser implements UserInterface, PasswordAuthenticatedUserInterface
{
    public function __construct(
        private User $user,
    ) {}

    public function getPassword(): string
    {
        return $this->user->getPassword();
    }

    public function getRoles(): array
    {
        return ["ROLE_USER"];
    }

    public function getUserIdentifier(): string
    {
        return $this->user->getEmail();
    }

    public function eraseCredentials(): void
    {
        // TODO: Implement eraseCredentials() method.
    }
}
