<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\Common\Collections\Collection;

class Room
{
    public const  STATUS_WAITING = 0;
    public const STATUS_PLAYING = 1;
    public const  STATUS_FINISHED = 2;

    public function __construct(
        private ?int $id,
        private string $name,
        private string $code,
        private int $status,
        private \DateTime $createdAt,
        private Collection $players,
    ) {}

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getPlayers(): Collection
    {
        return $this->players;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function setCode(string $code): void
    {
        $this->code = $code;
    }

    public function setStatus(int $status): void
    {
        if (!in_array($status, [
            self::STATUS_WAITING,
            self::STATUS_PLAYING,
            self::STATUS_FINISHED,
        ])) {
            throw new \InvalidArgumentException('Invalid status');
        }
        $this->status = $status;
    }

    public function setCreatedAt(\DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function label() :string
    {
        return match ($this->status) {
            self::STATUS_WAITING => 'Ожидание игроков',
            self::STATUS_PLAYING => 'Игра идёт',
            self::STATUS_FINISHED => 'Завершена',
            default => throw new \Exception('Unexpected match value'),
        };
    }
}
