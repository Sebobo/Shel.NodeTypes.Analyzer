<?php
declare(strict_types=1);

namespace Shel\ContentRepository\Debugger\Controller;

/**
 * This file is part of the Shel.ContentRepository.Debugger package.
 *
 * (c) 2021 Sebastian Helzle
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Cache\Exception\NoSuchCacheException;
use Neos\Eel\Exception as EelException;
use Neos\Eel\ParserException;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cache\CacheManager;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Flow\Security\Context as SecurityContext;
use Neos\Flow\Security\Exception\AuthenticationRequiredException;
use Neos\Neos\Controller\CreateContentContextTrait;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Domain\Service\UserService;
use Shel\ContentRepository\Debugger\Service\EelEvaluationService;

/**
 * @Flow\Scope("singleton")
 */
class ReplController extends ActionController
{
    use CreateContentContextTrait;

    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'json' => JsonView::class,
    ];

    /**
     * @Flow\Inject
     * @var EelEvaluationService
     */
    protected $eelEvaluationService;

    /**
     * @Flow\Inject
     * @var SecurityContext
     */
    protected $securityContext;

    /**
     * @Flow\Inject
     * @var UserService
     */
    protected $userService;

    /**
     * @Flow\Inject
     * @var SiteRepository
     */
    protected $siteRepository;

    /**
     * @Flow\Inject
     * @var CacheManager
     */
    protected $cacheManager;

    /**
     * Returns information about the current user and site
     * @throws AuthenticationRequiredException
     */
    public function getContextDataAction(): void
    {
        $user = $this->userService->getCurrentUser();

        if (!$user) {
            throw new AuthenticationRequiredException('Authentication required');
        }

        $contentContext = $this->createContentContext('live', []);
        $siteNode = $contentContext->getCurrentSiteNode();
        $currentSite = $this->siteRepository->findOneByNodeName($siteNode->getName());
        $primaryDomain = $currentSite ? $currentSite->getPrimaryDomain() : null;

        $this->view->assign('value', [
            'success' => true,
            'user' => [
                'name' => $user->getName()->getAlias(),
                'label' => $user->getLabel()
            ],
            'currentSite' => [
                'name' => $siteNode->getLabel(),
                'nodeName' => $siteNode->getName(),
                'primaryDomain' => $primaryDomain ? $primaryDomain->getHostname() : 'undefined'
            ],
        ]);
    }

    /**
     * @param string $expression
     */
    public function evaluateEelExpressionAction(string $expression): void
    {
        $result = '';
        $message = '';
        $success = true;

        $contentContext = $this->createContentContext('live', []);

        $evaluationContext = [
            'site' => $contentContext->getCurrentSiteNode(),
        ];

        try {
            $result = $this->eelEvaluationService->evaluateEelExpression('${' . $expression . '}', $evaluationContext);
            $result = json_encode($result, JSON_THROW_ON_ERROR);
        } catch (EelException | ParserException | \JsonException $e) {
            $success = false;
            $message = $e->getMessage();
        }

        $this->view->assign('value', [
            'success' => $success,
            'result' => $result,
            'message' => $message,
        ]);
    }

    /**
     * @param string|null $cacheIdentifier
     * @throws \JsonException|NoSuchCacheException
     */
    public function flushCacheAction(string $cacheIdentifier = null)
    {
        $success = true;

        if ($cacheIdentifier) {
            if ($this->cacheManager->hasCache($cacheIdentifier)) {
                $this->cacheManager->getCache($cacheIdentifier)->flush();
                $message = 'The cache "' . $cacheIdentifier . '" has been flushed';
            } else {
                $success = false;
                $message = 'The cache "' . $cacheIdentifier . '" does not exist';
            }
        } else {
            $this->cacheManager->flushCaches();
            $message = 'Flushed all caches';
        }

        // Echo response as we have to exit the process prematurely or the application
        // will throw errors due to the flushed caches.
        echo json_encode([
            'success' => $success,
            'message' => $message,
        ], JSON_THROW_ON_ERROR);
        exit;
    }
}
