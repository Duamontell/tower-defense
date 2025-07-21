<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\Mercure\Update;
use Symfony\Component\Mercure\HubInterface;

class MercureService
{
    public function __construct(
        private string $mercureUrl,
        private HubInterface $hub
    ) {}

    public function getMercureUrl(): string
    {
        return $this->mercureUrl;
    }

    public function publish(string $topic, array $data): void
    {
        $update = new Update($topic, json_encode($data));
        $this->hub->publish($update);
    }
}
