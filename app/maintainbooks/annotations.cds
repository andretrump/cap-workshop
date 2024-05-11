using AdminService as service from '../../srv/admin-service';


annotate service.Books with @(UI.HeaderInfo: {
    Title         : {
        $Type: 'UI.DataField',
        Value: title,
    },
    TypeName      : 'Book',
    TypeNamePlural: 'Books',
    Description   : {
        $Type: 'UI.DataField',
        Value: descr,
    },
});

annotate service.Books with @(
    UI.SelectionFields: [
        price,
        stock,
        currency_code,
        author_ID,
    ],
    UI.LineItem       : [
        {
            $Type: 'UI.DataField',
            Value: ID,
        },
        {
            $Type: 'UI.DataField',
            Value: title,
        },
        {
            $Type: 'UI.DataField',
            Value: stock,
        },
        {
            $Type: 'UI.DataField',
            Value: price,
        },
        {
            $Type: 'UI.DataField',
            Value: currency_code,
        },
    ]
) {
    title @Common.Label: 'Title';
    descr @Common.Label: 'Description';
    price @Common.Label: 'Price';
    stock @Common.Label: 'Stock';
};

annotate service.Books with @(
    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General',
        ID    : 'General',
        Target: '@UI.FieldGroup#General',
    }, ],
    UI.FieldGroup #General: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: author_ID,
                Label: 'Author',
            },
            {
                $Type: 'UI.DataField',
                Value: currency_code
            },
            {
                $Type: 'UI.DataField',
                Value: stock
            },
        ],
    }
) {
    @Common: {
        Text           : author.name,
        TextArrangement: #TextFirst,
        Label          : 'Author',
        ValueList      : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Authors',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: author_ID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                }
            ]
        }
    }
    author;
};

annotate service.Authors with {
    ID @Common.Label: 'Author'
};
