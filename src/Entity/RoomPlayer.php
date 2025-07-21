<?php

namespace App\Entity;

class RoomPlayer
{
    public function __construct(
        private ?int $id,
        private Room $room,
        private User $player,
        private int $slot,
        private bool $isReady
    ) {}

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRoom(): Room
    {
        return $this->room;
    }

    public function getPlayer(): User
    {
        return $this->player;
    }

    public function getSlot(): int
    {
        return $this->slot;
    }

    public function isReady(): bool
    {
        return $this->isReady;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function setRoom(Room $room): void
    {
        $this->room = $room;
    }

    public function setPlayer(User $player): void
    {
        $this->player = $player;
    }

    public function setSlot(int $slot): void
    {
        $this->slot = $slot;
    }

    public function setIsReady(bool $isReady): void
    {
        $this->isReady = $isReady;
    }
}
