
import { useState, useEffect, createRef } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { AddBox, Edit, Visibility } from "@material-ui/icons";
import MuiTable from "../../components/table/table_index";
import { BASE_URL, PATH_PRODUCTCATALOGUE } from "../../utils/constants";
import { PATH_INVENTORYSTOCK } from "../../utils/constants";
import { PATH_PRODUCTCATEGORY } from "../../utils/constants";
import makeApiCall from "../../utils/makeApiCall";

function ProductCatalogueTable() {

  const tableRef = createRef();
  const snackbar = useSnackbar();
  const navigate =  useNavigate();



  const [InventoryStocks, setInventoryStocks] = useState({});

  useEffect(() => {
    const fetchInventoryStocks = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_INVENTORYSTOCK}`
      );
      const jsonResp = await typesResponse.json();

      if (Array.isArray(jsonResp.value) && jsonResp.value.length > 0) {
        const types = {};
        jsonResp.value.forEach((item) => {
          types[`${item.InventoryId}`] = item.ExpirtyDate
        });
        setInventoryStocks(types);
      } else {
        snackbar.enqueueSnackbar("No data for InventoryStocks. Please Add InventoryStocks First.", {
          variant: "warning",
        });
	setInventoryStocks({});
      }
    };
    fetchInventoryStocks();
  }, []);


  const [ProductCategories, setProductCategories] = useState({});

  useEffect(() => {
    const fetchProductCategories = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_PRODUCTCATEGORY}`
      );
      const jsonResp = await typesResponse.json();

      if (Array.isArray(jsonResp.value) && jsonResp.value.length > 0) {
        const types = {};
        jsonResp.value.forEach((item) => {
          types[`${item.ProductCategoryId}`] = item.ProductName
        });
        setProductCategories(types);
      } else {
        snackbar.enqueueSnackbar("No data for ProductCategories. Please Add ProductCategories First.", {
          variant: "warning",
        });
	setProductCategories({});
      }
    };
    fetchProductCategories();
  }, []);

  const columns = [
    { title: "ProductId", field: "ProductId", editable: "never" },
      { title: "CategoryId", field: "CategoryId" },
      { title: "ProductName", field: "ProductName" },
      { title: "Stock", field: "ProductCatalogueStock", lookup: InventoryStocks },
      { title: "Category", field: "ProductCatalogueCategory", lookup: ProductCategorys },
  ];
  
  const fetchData = async (query) => {
    return new Promise(async (resolve, reject) => {
      const { page, orderBy, orderDirection, search, pageSize } = query;
      const url = `${BASE_URL}${PATH_PRODUCTCATALOGUE}`;
      let temp = url; // Initialize with the base URL
      let filterQuery = ""; // Initialize filter query as an empty string
  
      // Handle sorting
      if (orderBy) {
        temp += `?$orderby=${orderBy.field} ${orderDirection}`;
      }
  
      // Handle searching
      if (search) {
        filterQuery = `$filter=contains($screen.getSearchField().getName(), '${search}')`;
        temp += orderBy ? `&${filterQuery}` : `?${filterQuery}`;
      }
  
      // Handle pagination
      if (page > 0) {
        const skip = page * pageSize;
        temp += orderBy || search ? `&$skip=${skip}` : `?$skip=${skip}`;
      }
  
      const countUrl = search ? `${url}/$count?${filterQuery}` : `${BASE_URL}${PATH_PRODUCTCATALOGUE}/$count`;
      let total = null;

      try {
        const countResponse = await makeApiCall(countUrl);
        const e = await countResponse.text();
        total = parseInt(e, 10);
  
        const response = await makeApiCall(temp);
        const { value } = await response.json();
  
        if (value.length === 0) {
          return resolve({
            data: [],
            page: page,
            totalCount: 0,
            error: "Error fetching data"
          });
        } else {
          return resolve({
            data: value,
            page: page,
            totalCount: total,
          });
        }
      } catch (error) {
        snackbar.enqueueSnackbar(`Trips API call Failed! - ${error.message}`, {
          variant: "error",
        });
        console.error("API call failed:", error);
        reject(error);
      }
    });
  };

  return (
    <div className="product-container">
      <MuiTable
        tableRef={tableRef}
        title="Entity_Table"
        cols={columns}
        data={fetchData}
        size={5}
        actions={[
          {
            icon: AddBox,
            tooltip: "Add",
            onClick: () => navigate("/ProductCatalogues/create"),
            isFreeAction: true,
          },
          {
            icon: Visibility,
            tooltip: "View",
            onClick: (event, rowData) =>
            navigate(`/ProductCatalogues/view/${rowData.ProductId}`),
          },
          {
            icon: Edit,
            tooltip: "Edit",
            onClick: (event, rowData) =>
            navigate(`/ProductCatalogues/edit/${rowData.ProductId}`),
          },
        ]}
        onRowDelete={async (oldData) => {
          const resp = await makeApiCall(
            `${BASE_URL}${PATH_PRODUCTCATALOGUE}(${oldData.ProductId})`,
            "DELETE"
          );
          if (resp.ok) {
            tableRef.current.onQueryChange();
            snackbar.enqueueSnackbar("Successfully deleted ProductCatalogues", {
              variant: "success",
            });
          } else {
            const jsonData = await resp.json();
            snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
              variant: "error",
            });
          }
        }}
      />
    </div>
  );
}

export default ProductCatalogueTable;
