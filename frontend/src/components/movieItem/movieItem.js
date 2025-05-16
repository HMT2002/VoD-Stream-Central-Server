export class videoItem {
  constructor(title, release_date, img, type, id) {
    this.title = title;
    this.release_date = release_date;
    this.img = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/' + img;
    this.type = type;
    this.id = id;
  }
}
