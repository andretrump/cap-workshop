using {com.bookshop as db} from '../db/schema';

@requires: 'authenticated-user'
service OrderService {
    @readonly
    entity Books  as
        projection on db.Books {
            *,
            author.name as name
        }
        excluding {
            createdAt,
            createdBy,
            modifiedAt,
            modifiedBy
        };

    @restrict: [
        {
            grant: '*',
            to   : 'authenticated-user',
            where: '$user = createdBy'
        },
        {
            grant: '*',
            to   : 'Administrator'
        }
    ]
    entity Orders as
        projection on db.Orders {
            *,
            status @readonly,
            number @readonly
        }
        actions {
            action   cancel();
            action   submit();
            function getTotal() returns Decimal;
        };

    @requires: 'Administrator'
    action   massCancel(IDs : array of UUID) returns Integer;

    @requires: 'Administrator'
    function getNumberOfSubmittedOrders()    returns Decimal;
}
