<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class GameController extends AbstractController
{
    #[Route('/menu', name: 'menu')]
    public function menu() :Response
    {
        return $this->render('menu/menu.html.twig');
    }

    #[Route('/game', name: 'game', methods: ['GET'])]
    public function game(Request $request) :Response
    {
        $level = (int)$request->get('level');

        return $this->render('game/game.html.twig', [
            'level' => $level,
        ]);
    }
}
