import app from 'flarum/common/app';

import Widgets from 'flarum/extensions/afrux-forum-widgets-core/common/extend/Widgets';

import BlogFeaturedWidget from './components/BlogFeaturedWidget';

export default function registerWidget() {
  new Widgets()
    .add({
      key: 'blogFeaturedArticles',
      component: BlogFeaturedWidget,
      isDisabled: () => !('v17development-blog' in flarum.extensions),
      isUnique: false,

      placement: 'top',
      position: 1,
    })
    .extend(app, 'davwheat-blog-featured-panel');
}
