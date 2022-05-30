import app from 'flarum/admin/app';
import registerWidget from '../common/registerWidget';

app.initializers.add('davwheat/blog-featured-panel', () => {
  registerWidget();
});
