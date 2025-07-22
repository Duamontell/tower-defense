<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class GameController extends AbstractController
{
    public function menu(): Response
    {
        return $this->render('menu/main-menu.html.twig');
    }

    public function selectLevel(): Response
    {
        return $this->render('menu/select-level.html.twig');
    }

    public function gameRules(): Response
    {
        return $this->render('game/game-rules.html.twig');
    }

    public function singleplayer(Request $request): Response
    {
        $level = (int) $request->get('level');
        $userId = uniqid();

        return $this->render('game/game.html.twig', [
            'level' => $level,
            'userId' => $userId,
            'gamemode' => 'singleplayer',
        ]);
    }

    public function game(Request $request): Response
    {
        $level = (int) $request->get('level');
        // Получаем id текущего пользователя, пока что генерация
        $userId = uniqid();
        //      Можно сделать подписку(topic) на имя комнаты: topic=/game/room=$roomId
//        $roomId = uniqid();
        $players = [
            [
                'userId' => $userId,
                'config' => '1'
            ],
            [
                'userId' => uniqid(),
                'config' => '2'
            ]
        ];

        return $this->render('game/game.html.twig', [
            'level' => $level,
            'userId' => $userId,
            'gamemode' => 'multiplayer',
            'roomConfig' => [
                'players' => array_map(fn($p) => [
                    'userId' => $p['userId'],
                    'config' => $p['config']
                ], $players),
            ],
        ]);
    }
}
