import { create } from 'express-handlebars';
import { join } from 'path';
export class Notification {
  async render(template: string, data: any, layout = 'bartercard') {
    const partialsDir = join(__dirname, '../../', 'views/partials');
    const hbs = create({
      extname: 'hbs',
      partialsDir: partialsDir,
      layoutsDir: join(__dirname, '../../', 'views/layouts'),
      defaultLayout: 'bartercard',
    });
    const view = await hbs.renderView(join(partialsDir, template), {
      layout: layout,
      ...data,
    });
    return view;
  }
}
