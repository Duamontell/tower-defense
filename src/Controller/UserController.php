<?php

declare(strict_types=1);

namespace App\Controller;

use App\Security\SecurityUser;
use App\Security\UserAuthenticator;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;

class UserController extends AbstractController
{
    public function __construct(
        private UserService $userService,
        private UserAuthenticatorInterface $userAuthenticatorService,
        private UserAuthenticator $userAuthenticator,
    ) {}

    public function showRegistrationForm(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('menu');
        }

        return $this->render('user/registration_page.html.twig');
    }

    public function registerUser(Request $request): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('menu');
        }

        $userInfo = $request->request->all();
        try {
            $user = $this->userService->saveUser($userInfo);
            $securityUser = new SecurityUser($user);

            return $this->userAuthenticatorService->authenticateUser(
                $securityUser,
                $this->userAuthenticator,
                $request
            );
        } catch (\RuntimeException $e) {
            $this->addFlash('error', $e->getMessage());
            return $this->redirectToRoute('registration_page');
        }
    }
}
