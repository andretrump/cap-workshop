using {com.bookshop as db} from '../db/schema';

@requires: 'authenticated-user'
service SupplyService {
    entity Books as projection on db.Books;

    @readonly
    entity Suppliers as projection on db.Suppliers;
}