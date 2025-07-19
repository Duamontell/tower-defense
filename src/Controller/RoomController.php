<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class RoomController extends AbstractController
{
    #[Route('/room')]
    public function index(): Response
    {
        return $this->render('room/index.html.twig');
    }
}
