using {com.bookshop as db} from '../db/schema';

service AdminService {
    entity Books   as projection on db.Books;
    entity Authors as projection on db.Authors;
    entity Genres  as projection on db.Genres;
}
