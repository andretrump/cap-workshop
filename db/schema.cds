using {
    cuid,
    Currency,
    managed,
} from '@sap/cds/common';

namespace com.bookshop;

entity Books : managed {
    key ID       : Integer;
        title    : String(111)                @mandatory;
        descr    : String(1111);
        stock    : Integer;
        price    : Decimal;
        currency : Currency;
        author   : Association to one Authors @mandatory;
        genres   : Composition of many BooksGenres
                       on genres.book = $self;
        supplier : Association to one Suppliers;
}

entity Authors : managed {
    key ID           : Integer;
        name         : String(111) @mandatory;
        dateOfBirth  : Date;
        dateOfDeath  : Date;
        placeOfBirth : String;
        placeOfDeath : String;
        books        : Association to many Books
                           on books.author = $self;
}

entity BooksGenres {
    key book  : Association to one Books;
    key genre : Association to one Genres;
}

entity Genres : managed {
    key ID    : Integer;
        name  : String @mandatory;
        descr : String @mandatory;
        books : Composition of many BooksGenres
                    on books.genre = $self;
}

type Status : Integer enum {
    ![In creation] = 0;
    Submitted      = 1;
    Fulfilled      = 2;
    Shipped        = 3;
    Canceled       = -1;
}

entity Orders : cuid, managed {
    number : Integer;
    status : Status @assert.range;
    items  : Composition of many OrderItems
                 on items.order = $self;
}

entity OrderItems {
    key order  : Association to one Orders;
    key pos    : Integer;
        book   : Association to one Books @mandatory;
        amount : Integer                  @mandatory;
}

using {API_BUSINESS_PARTNER as bupa} from '../srv/external/API_BUSINESS_PARTNER';

entity Suppliers as
    projection on bupa.A_BusinessPartner {
        key BusinessPartner          as ID,
            BusinessPartnerFullName  as fullName,
            BusinessPartnerIsBlocked as isBlocked
    }