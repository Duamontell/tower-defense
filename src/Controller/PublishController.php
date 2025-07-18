<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;

class PublishController extends AbstractController
{
    //    #[Route('/publish', name: 'publish')]
//    public function publish(HubInterface $hub): Response
//    {
//        $update = new Update(
//        'http://localhost:8000/menu',
//            json_encode(['status' => 'Успешно!'])
//        );
//
//        $hub->publish($update);
//
//        return new Response('published!');
//    }

    // #[Route('/publish', name: 'publish')]
    // public function testUserId(HubInterface $hub): Response
    // {
    //     $update = new Update(
    //         'http://localhost:8000/game',
    //         json_encode([
    //             'type' => 'userId',
    //             'userId' => 1
    //         ])
    //     );

    //     $hub->publish($update);

    //     return new Response('published!');
    // }

    #[Route('/publish', name: 'publish')]
    public function test(HubInterface $hub): Response
    {
        $update = new Update(
            'http://localhost:8000/game',
            json_encode([
                'type' => 'addTower',
                'userId' => 2,
                'towerId' => 'tower1',
                'zoneId' => 6,
                'name' => 'ArchersTower'
            ])
        );

        $hub->publish($update);

        return new Response('published!');
    }
}
