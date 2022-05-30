import app from 'flarum/common/app';

import extractText from 'flarum/common/utils/extractText';
import icon from 'flarum/common/helpers/icon';

import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Button from 'flarum/common/components/Button';

import Widget, { WidgetAttrs } from 'flarum/extensions/afrux-forum-widgets-core/common/components/Widget';

import FeaturedBlogItem from 'flarum/v17development/blog/components/FeaturedBlogItem';

import type Discussion from 'flarum/common/models/Discussion';
import type Mithril from 'mithril';

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
    return extractText(app.translator.trans('davwheat-blog-featured-panel.forum.widget.title'));
  }

  oncreate(vnode: Mithril.VnodeDOM<any, this>): void {
    super.oncreate(vnode);

    this.loadData();
  }

  header() {
    const iconName = this.icon();
    const title = this.title();

    const listEl: HTMLElement | undefined = this.$('.BlogFeaturedWidget-articleList')[0];

    const listScrolledLeft = (listEl?.scrollLeft ?? 0) === 0;
    const listScrolledRight = listEl?.scrollWidth - listEl?.clientWidth - listEl?.scrollLeft === 0;

    return title ? (
      <div className="AfruxWidgets-Widget-title">
        {iconName ? <span className="AfruxWidgets-Widget-title-icon">{icon(iconName)}</span> : null}
        <span className="AfruxWidgets-Widget-title-label">{title}</span>

        <Button
          class="Button Button--icon BlogFeaturedWidget-scrollButton"
          icon="fas fa-chevron-left"
          disabled={listScrolledLeft}
          aria-label={app.translator.trans('davwheat-blog-featured-panel.forum.widget.scrollers.left')}
          onclick={() => {
            this.$('.BlogFeaturedWidget-articleList')[0].scrollLeft -= 316;
          }}
        />
        <Button
          class="Button Button--icon BlogFeaturedWidget-scrollButton"
          icon="fas fa-chevron-right"
          disabled={listScrolledRight}
          aria-label={app.translator.trans('davwheat-blog-featured-panel.forum.widget.scrollers.right')}
          onclick={() => {
            this.$('.BlogFeaturedWidget-articleList')[0].scrollLeft += 316;
          }}
        />
      </div>
    ) : null;
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
            <p>Failed to load blog articles.</p>
          </div>
        );

      case LoadingState.loaded:
        if (this.data.length !== 0) return null;

        return (
          <div class="BlogFeaturedWidget-loadStatusMessage Placeholder">
            <p>There are no featured blog articles.</p>
          </div>
        );
    }
  }

  async loadData() {
    try {
      const data = await app.store.find<Discussion[]>('discussions', { filter: { q: 'is:blog' }, sort: '-createdAt', page: { limit: 9 } });

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
