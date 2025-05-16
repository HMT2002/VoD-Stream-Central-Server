export class videoItem {
  readonly title: string = '';
  readonly release_date: string = '';
  readonly img: string = '';
  readonly type: string = '';
  readonly id: string = '';
  constructor(title?: string, release_date?: string, img?: string, type?: string, id?: string) {
    if (title !== undefined) {
      this.title = title;
    }
    if (release_date !== undefined) {
      this.release_date = release_date;
    }
    if (img !== undefined) {
      this.img = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/' + img;
    }
    if (type !== undefined) {
      this.type = type;
    }
    if (id !== undefined) {
      this.id = id;
    }
  }
}
