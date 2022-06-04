<?php

/*
 * This file is part of davwheat/blog-featured-widget.
 *
 * Copyright (c) 2022 David Wheatley.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Davwheat\BlogFeaturedWidget;

use Flarum\Extend;
use Flarum\Extension\ExtensionManager;

$settingsKeys = [
    'flarum-tags' => ['show_on_tag_pages'],
    'flarum-subscriptions' => ['show_on_following_page'],
    'fof-byobu' => ['show_on_byobu_page'],
    'clarkwinkelmann-bookmarks' => ['show_on_bookmarks_page'],
];

$settingsExtender = new Extend\Settings();
$extManager = resolve(ExtensionManager::class);

foreach ($settingsKeys as $ext => $keys) {
    if ($extManager->isEnabled($ext)) {
        foreach ($keys as $key) {
            $settingsExtender->serializeToForum("davwheat-blog-featured-widget.$key", "davwheat-blog-featured-widget.$key", 'boolval', true);
        }
    }

    foreach ($keys as $key) {
        $settingsExtender->default("davwheat-blog-featured-widget.$key", true);
    }
}

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    $settingsExtender,
];
