document.addEventListener('DOMContentLoaded', function () {

    function fetchMenuData(value, callback) {
        fetch(`/api/subcategories/${value}`)
            .then(response => response.json())
            .then(result => {
                callback(result.sub_categories);
            })
            .catch(err => console.log(err));
    }

    const topCtgSelectElm = document.getElementById("select-top-ctg-name");

    // Menu to be changed
    const subCtgSelectElm = document.getElementById("select-sub-ctg-name");

    topCtgSelectElm.addEventListener('change', function (e) {

        const selectedTopCategory = e.target.value;
        if (selectedTopCategory === 'select') {
            setCategoryItems([{ itemName: 'Select', itemValue: 'select' }]);
            return;
        }

        fetchMenuData(selectedTopCategory, setCategoryItems);

        function setCategoryItems(arrNewItems) {

            // remove all child Nodes first
            while (subCtgSelectElm.firstChild) {
                // node.firstChild get the first element for first time
                // node.firstChild get the second element for 2nd time
                // until the last element.
                subCtgSelectElm.removeChild(subCtgSelectElm.firstChild);
            }

            $('.selectpicker').selectpicker('refresh');

            arrNewItems.forEach(item => {
                createOptionElement(item.itemName, item.itemValue);
            });


            $('.selectpicker').selectpicker('refresh');

            function createOptionElement(itemName, itemValue) {
                const optionElement = document.createElement("option");
                optionElement.innerText = itemName;
                optionElement.value = itemValue;
                subCtgSelectElm.append(optionElement);
            }

        }

    });
});
