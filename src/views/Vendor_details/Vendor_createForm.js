
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BASE_URL,
  PATH_REORDER,
  PATH_PRODUCTCATEGORY,
  PATH_PURCHASEORDER,
  PATH_PRODUCTSTORE,
  PATH_VENDOR,
  PATH_DOCUMENT,
  PATH_PRODUCTCATALOGUE,
  PATH_INVENTORYSTOCK,
  } from '../../utils/constants';
import makeApiCall from '../../utils/makeApiCall';
import moment from 'moment';
import MuiSelect from '../../components/select/select_index';
import MuiDatePicker from '../../components/date-picker/date-picker'
import { useSnackbar } from 'notistack';
import { vendorViewConfig } from '../../utils/display_configuration';

const useStyles = makeStyles((theme) => ({
  table: {
    margin: '0 auto',
    width: '90%',
  },
  titleCell: {
    width: '35%',
    textAlign: 'right',
    borderBottom: 'none',
  },
  valueCell: {
    textAlign: 'left',
    borderBottom: 'none',
  },
  link: {
    color: theme.palette.secondary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const CreateVendorForm = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const styles = useStyles();

  const [formData, setFormData] = useState({});
        const [errorData, setErrorData] = useState({});


  const handleChange = (key, value) => {
    setFormData({ ...formData, ...{ [key]: value } });
  };

  const submitForm = async () => {
          const { 
        ProductUnitsPurchased,
        TotalUnitsPurchasedPrice,
        PricePerUnit,
      ...otherData } = formData;

      try {
        const resp = await makeApiCall(
          `${BASE_URL}${PATH_VENDOR}`,
          'POST',
          JSON.stringify({
            ...otherData,
                                ProductUnitsPurchased: parseInt(ProductUnitsPurchased),
                TotalUnitsPurchasedPrice: parseInt(TotalUnitsPurchasedPrice),
                PricePerUnit: parseInt(PricePerUnit),
          })
        );

        if (resp.ok) {
          snackbar.enqueueSnackbar('Successfully created Vendor', {
            variant: 'success',
          });
          navigate({ pathname: '/vendors' });
        } else {
          const jsonData = await resp.json();
          snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
            variant: 'error',
          });
        }
      } catch (error) {
        // Handle any errors that occur during the API calls or processing
        snackbar.enqueueSnackbar(`Error: ${error.message}`, {
          variant: 'error',
        });
      }
      };

  return (
    <>
      <Box padding={2}>
        <Grid>
          <Grid item lg={12} xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography className="page-heading" variant="h5">
                Create Vendor
              </Typography>
              <div className="action-buttons">
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  className="margin-right"
                  onClick={submitForm}
                >
                  Save
                </Button>
                &nbsp;
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate({ pathname: '/vendors' })}
                >
                  Cancel
                </Button>
              </div>
            </Box>
          </Grid>
          <Divider />
          <Box marginTop={2} className="form-container">
            <Grid container item lg={12} xs={12}>
              {Object.keys(vendorViewConfig)?.map((config, ind) => (
                <>
                  <Grid item lg={5} md={5} xs={12}>
                    <Box marginTop={1}>
                      <Typography variant="h6">{config}</Typography>
                      <Table size="small" className={styles.table}>
                        <TableBody>
                          {vendorViewConfig[config]?.map(
                            ({ key, value, type, required }) => (
                              <TableRow className="responsive-table-row">
                                <TableCell
                                  className={[
                                    styles.titleCell,
                                    'row-label',
                                  ].join(' ')}
                                >
                                  <Typography variant="body1">
                                    {value}
                                    {required ? '*' : ''}:
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  className={[
                                    styles.valueCell,
                                    'row-value',
                                  ].join(' ')}
                                >
                                  {key === 'Vendor' ? (
                                    <Typography variant="body1">
                                      {formData[key]}
                                    </Typography>
                                  ) : 
                                  type === 'date' ? (
                                    <MuiDatePicker
                                      name="Date Picker"
                                      handleChange={(e) => {
                                        handleChange(key, moment.utc(e.target.value).format(
                                          "YYYY-MM-DDTHH:mm:ss[Z]"
                                        ))
                                      }}
                                      error={errorData}
                                    />
                                  ) : type === 'boolean' ? (
                                    <Checkbox
                                      checked={formData[key] || false}
                                      onChange={(e) =>
                                        handleChange(key, e.target.checked)
                                      }
                                    />
                                  ) : (
                                    <>
                                      <TextField
                                        name={key}
                                        fullWidth
                                        className="text-field-custom"
                                        variant="outlined"
                                        size="small"
                                        type={type}
                                        error={errorData[key]}
                                        helperText={errorData[key]}
                                        value={formData[key] || ''}
                                        onChange={(e) => {
                                          if (e.target.reportValidity()) {
                                            handleChange(key, e.target.value);
                                          }
                                        }}
                                      />
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Grid>
                  <Grid item lg={1} md={1} xs={false} />
                </>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Box>
    </>
  );
};

export default CreateVendorForm;
