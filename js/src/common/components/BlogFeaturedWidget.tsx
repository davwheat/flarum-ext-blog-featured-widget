import app from 'flarum/common/app';

import extractText from 'flarum/common/utils/extractText';
import icon from 'flarum/common/helpers/icon';

import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Button from 'flarum/common/components/Button';
import Link from 'flarum/common/components/Link';

import Widget, { WidgetAttrs } from 'flarum/extensions/afrux-forum-widgets-core/common/components/Widget';

// @ts-expect-error no v17 Blog typings available
import FeaturedBlogItem from 'flarum/v17development/blog/components/FeaturedBlogItem';

import type Discussion from 'flarum/common/models/Discussion';
import type Mithril from 'mithril';
import { ApiQueryParamsPlural } from 'flarum/common/Store';

interface IBlogFeaturedWidgetAttrs extends WidgetAttrs {}

enum LoadingState {
  loading,
  loaded,
  failed,
}

export default class BlogFeaturedWidget extends Widget<IBlogFeaturedWidgetAttrs> {
  data: Discussion[] = [];
  loadingState: LoadingState = LoadingState.loading;

  className() {
    return 'BlogFeaturedWidget-widget';
  }

  icon() {
    return 'fas fa-th-large';
  }

  title() {
    return extractText(app.translator.trans('davwheat-blog-featured-widget.forum.widget.title'));
  }

  oncreate(vnode: Mithril.VnodeDOM<any, this>): void {
    super.oncreate(vnode);

    this.loadData();
  }

  protected shouldRemoveFromPage(attr: string, extension?: string) {
    if (!extension || extension in flarum.extensions) {
      return !app.forum.attribute<boolean>(`davwheat-blog-featured-widget.${attr}`);
    }

    return false;
  }

  view(): Mithril.Children {
    if (this.shouldRemoveFromPage('show_on_tag_pages', 'flarum-tags')) {
      if (app.current.data.routeName === 'tag') return null;
    }
    if (this.shouldRemoveFromPage('show_on_following_page', 'flarum-subscriptions')) {
      if (app.current.data.routeName === 'following') return null;
    }
    if (this.shouldRemoveFromPage('show_on_byobu_page', 'fof-byobu')) {
      if (app.current.data.routeName === 'byobuPrivate') return null;
    }
    if (this.shouldRemoveFromPage('show_on_bookmarks_page', 'clarkwinkelmann-bookmarks')) {
      if (app.current.data.routeName === 'bookmarks') return null;
    }

    return super.view();
  }

  header() {
    const iconName = this.icon();

    const listEl: HTMLElement | undefined = this.$('.BlogFeaturedWidget-articleList')[0];

    const listScrolledLeft = (listEl?.scrollLeft ?? 0) === 0;
    const listScrolledRight = listEl?.scrollWidth - listEl?.clientWidth - listEl?.scrollLeft === 0;

    return (
      <div class="AfruxWidgets-Widget-title">
        {iconName ? <span class="AfruxWidgets-Widget-title-icon">{icon(iconName)}</span> : null}
        <span class="AfruxWidgets-Widget-title-label BlogFeaturedWidget-title">{this.title()}</span>
        <span class="AfruxWidgets-Widget-title-label BlogFeaturedWidget-titleSeparator" aria-hidden="true">
          &bull;
        </span>
        <Link href={app.route('blog')} class="AfruxWidgets-Widget-title-label BlogFeaturedWidget-moreLink">
          {app.translator.trans('davwheat-blog-featured-widget.forum.widget.more_blog_link')}
        </Link>

        <Button
          class="Button Button--icon BlogFeaturedWidget-scrollButton"
          icon="fas fa-chevron-left"
          disabled={listScrolledLeft}
          aria-label={app.translator.trans('davwheat-blog-featured-widget.forum.widget.scrollers.left')}
          onclick={() => {
            this.$('.BlogFeaturedWidget-articleList')[0].scrollLeft -= 316;
          }}
        />
        <Button
          class="Button Button--icon BlogFeaturedWidget-scrollButton"
          icon="fas fa-chevron-right"
          disabled={listScrolledRight}
          aria-label={app.translator.trans('davwheat-blog-featured-widget.forum.widget.scrollers.right')}
          onclick={() => {
            this.$('.BlogFeaturedWidget-articleList')[0].scrollLeft += 316;
          }}
        />
      </div>
    );
  }

  content() {
    return (
      <div className="BlogFeaturedWidget-widgetContent">
        {this.loadingStatusMessage()}

        {this.loadingState === LoadingState.loaded && <div class="BlogFeaturedWidget-articleList">{this.data.map((d) => this.blogItem(d))}</div>}
      </div>
    );
  }

  loadingStatusMessage(): Mithril.Children {
    switch (this.loadingState) {
      case LoadingState.loading:
        return <LoadingIndicator />;

      case LoadingState.failed:
        return (
          <div class="BlogFeaturedWidget-loadStatusMessage Placeholder">
            <p>{app.translator.trans('davwheat-blog-featured-widget.forum.widget.status.error')}</p>
          </div>
        );

      case LoadingState.loaded:
        if (this.data.length !== 0) return null;

        return (
          <div class="BlogFeaturedWidget-loadStatusMessage Placeholder">
            <p>{app.translator.trans('davwheat-blog-featured-widget.forum.widget.status.no_data')}</p>
          </div>
        );
    }
  }

  requestParams(): ApiQueryParamsPlural {
    const languages = app.store.all('discussion-languages');
    // @ts-expect-error formatter is internal api, but there is no public api method to fetch this
    // TODO: [Flarum 1.4] see https://github.com/flarum/framework/pull/3451
    const selectedLanguage = m.route.param('lang') ? m.route.param('lang') : app.translator.formatter.locale;

    const params = {
      filter: { q: 'is:blog' },
      sort: '-createdAt',
      page: {
        limit: 9,
      },
    };

    if (languages?.length) {
      params.filter.q += ` language:${selectedLanguage}`;
    }

    return params;
  }

  async loadData() {
    try {
      const data = await app.store.find<Discussion[]>('discussions', this.requestParams());

      if (data) {
        this.data = data;
        this.loadingState = LoadingState.loaded;
      }
    } catch {
      this.loadingState = LoadingState.failed;
    }

    m.redraw();
  }

  blogItem(discussion: Discussion) {
    const defaultImage = app.forum.attribute('blogDefaultImage')
      ? `url(${app.forum.attribute('baseUrl') + '/assets/' + app.forum.attribute('blogDefaultImage')})`
      : null;

    return <FeaturedBlogItem article={discussion} defaultImage={defaultImage} />;
  }
}
