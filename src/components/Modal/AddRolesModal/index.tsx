import {
  Autocomplete,
  Button, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControlLabel, FormGroup,
  FormLabel,
  TextField
} from "@mui/material";
import styles from './styles.module.scss';
import {Form, Formik} from "formik";
import {validationEmptySchema, validationSchema} from "./validation.ts";
import React, {useEffect, useMemo, useState} from "react";
import {useAddRoleMutation, useDeleteRoleMutation} from "../../../api/users.ts";
import {useAddDutyRoleMutation, useDeleteDutyRoleMutation} from "../../../api/duties.ts";
import {AddRolesAgreeModal} from "./AddRolesAgreeModal";
import {getUniqueNumbers} from "../../../services/tabularGraph.ts";
import {setError} from "../../../slices/auth.ts";
import {useDispatch} from "react-redux";

interface AddRolesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  options: any;
  user: string;
  groupsOptions: any;
}

export const AddRolesModal: React.FC<AddRolesModalProps> = ({open, setSelected, setOpen, options, user, groupsOptions}) => {
  const [openAgree, setOpenAgree] = useState(false)
  const [addRole] = useAddRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()
  const [addDuty] = useAddDutyRoleMutation()
  const [deleteDuty] = useDeleteDutyRoleMutation()
  const [values, setValues] = useState()

  const [roles, setRoles] = useState({
    'admin': user && user.rolesArr.includes('admin'),
    'manager': user && user.rolesArr.includes('manager'),
    'duty': user && user.rolesArr.includes('duty'),
    'dispatcher': user && user.rolesArr.includes('dispatcher')
  })

  const selectedGroups = useMemo(() => {
    if(user && user.managerGroups) {
      return user.managerGroups.map((group) => groupsOptions.filter((opt) => opt.value === group)[0])
    }
    return []
  }, [user, groupsOptions])

  const [newSelected, setNewSelected] = useState([])
  const dispatch = useDispatch();
  const handleSubmit = (values) => {
    setValues(values)
    setOpenAgree(true)
  }
  const handleAgree = async(values, resetForm: () => void) => {
    try{
      const userId = values.autocomplete1.value
      const groups = values.autocomplete2 && values.autocomplete2.length && values.autocomplete2.map((group) => group.value) || []
      const userRoles = values.roles && Object.keys(values.roles) && Object.keys(values.roles).length && Object.keys(values.roles).filter((role) => values.roles[role]) || []
      const initRoles = user && user.rolesArr || []
      const selectedGroupsValues = selectedGroups.length && selectedGroups.map((group) => group.value) || []
      const newRoles = getUniqueNumbers(userRoles, initRoles)
      const newGroups = getUniqueNumbers(groups, selectedGroupsValues)
      if(newRoles.includes('admin')){
        if(initRoles.includes('admin')) {
          const response = deleteRole({
            user_id: userId,
            role_name: 'admin'
          })
          response.then((result) => {
            if(result.error){
              dispatch(setError(result.error.data.detail))
            }else {
              setOpen(false)
            }
          })
        } else {
          addRole({
            user_id: userId,
            role_name: 'admin'
          })
          setOpen(false)
        }
      }
      if(newRoles.includes('dispatcher')){
        if(initRoles.includes('dispatcher')) {
          deleteRole({
            user_id: userId,
            role_name: 'dispatcher',
          })
        } else {
          addRole({
            user_id: userId,
            role_name: 'dispatcher'
          })
        }
        setOpen(false)
      }
      if(newRoles.includes('duty')){
        if(initRoles.includes('duty')) {
          deleteDuty({
            duty_ids: [{duty_id: user.duty_id}]
          })
        } else {
          addDuty({
            user_ids: [{user_id: userId}],
          })
        }
        setOpen(false)
      }
      if(newRoles.includes('manager') || (newGroups && newGroups.length)){
        setOpen(false)
        if(initRoles.includes('manager')) {
          if(newGroups.length) {
            await Promise.all(
              newGroups && newGroups.length && newGroups.forEach((group) => {
                if(!groups.includes(group)) {
                  deleteRole({
                    user_id: userId,
                    role_name: 'manager',
                    group_id: group
                  })
                } else {
                  addRole({
                    user_id: userId,
                    role_name: 'manager',
                    group_id: group
                  })
                }
              })
            );
          } else {
            await Promise.all(
              groups && groups.length && groups.forEach((group) => {
                deleteRole({
                  user_id: userId,
                  role_name: 'manager',
                  group_id: group
                })
              })
            );
          }
        } else {
          await Promise.all(
            newGroups && newGroups.length && newGroups.forEach((group) => {
              addRole({
                user_id: userId,
                role_name: 'manager',
                group_id: group
              })
            })
          );
        }
      }
    }catch (e) {

    }
    setNewSelected([])
    setSelected({})
  }

  const selectedUser = useMemo(() => {
    const selected = user && options && options.length && options.filter((opt) => opt.value === user.user_id)
    return selected && selected.length && selected[0]
  }, [options, user])

  useEffect(() => {
    setRoles({
      'admin': user && user.rolesArr.includes('admin'),
      'manager': user && user.rolesArr.includes('manager'),
      'duty': user && user.rolesArr.includes('duty'),
      'dispatcher': user && user.rolesArr.includes('dispatcher')
    })
  }, [user, open])


  const handleChangeRole = (value) => {
    if(value === 'admin'){
      setRoles((prevState) => ({...prevState, 'admin': !prevState['admin']}))
    } else if(value === 'manager'){
      setRoles((prevState) => ({...prevState, 'manager': !prevState['manager']}))
    } else if(value === 'duty'){
      setRoles((prevState) => ({...prevState, 'duty': !prevState['duty']}))
    } else if(value === 'dispatcher'){
      setRoles((prevState) => ({...prevState, 'dispatcher': !prevState['dispatcher']}))
    }
  }

  const initValues = useMemo(() => {
    return({
      autocomplete1: selectedUser,
      roles: roles,
      autocomplete2: (selectedGroups.length && selectedGroups) || newSelected
    })
  }, [selectedUser, roles, selectedGroups, newSelected])

  return (
    <>
    <Formik
      initialValues={initValues}
      onSubmit={(values, {resetForm}) => handleSubmit(values, resetForm)}
      validationSchema={roles['manager'] ? validationSchema : validationEmptySchema}
      enableReinitialize={true}
    >
      {({ values, handleChange, handleBlur, resetForm, errors, touched, isValid }) => {
        const groups = values.autocomplete2 && values.autocomplete2.length && values.autocomplete2.map((group) => group.value) || []
        const selectedGroupsValues = selectedGroups.length && selectedGroups.map((group) => group.value) || []
        const userRoles = values.roles && Object.keys(values.roles) && Object.keys(values.roles).length && Object.keys(values.roles).filter((role) => values.roles[role]) || []
        const initRoles = user && user.rolesArr || []
        const newRoles = getUniqueNumbers(userRoles, initRoles)
        const newGroups = getUniqueNumbers(groups, selectedGroupsValues)
        return (
          <Form id="addRolesForm">
            <Dialog open={open} onClose={() => setOpen(false)} className={styles.modal}>
              <div className={styles.container}>
                <DialogTitle className={styles.title}>
                  Редактирование пользователя
                </DialogTitle>
                <DialogContent className={styles.content}>
                  <div className={styles.autocomplete}>
                    <Autocomplete
                      id="autocomplete1"
                      disabled
                      name="autocomplete1"
                      options={options}
                      getOptionLabel={(option) => option.name}
                      value={values.autocomplete1}
                      onChange={(_, newValue) => {
                        handleChange({
                          target: { name: 'autocomplete1', value: newValue },
                        });
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Выберите пользователя"
                          variant="outlined"
                          fullWidth
                          error={touched.autocomplete1 && Boolean(errors.autocomplete1)}
                          helperText={touched.autocomplete1 && errors.autocomplete1}
                        />
                      )}
                    />
                  </div>
                  <FormLabel className={styles.rolesTitle}>Выберите роли:</FormLabel>
                  <div className={styles.roles}>
                    <FormGroup>
                      <FormControlLabel
                        label="Администратор"
                        control={
                          <Checkbox
                            checked={values.roles['admin'] || false}
                            onChange={() => handleChangeRole('admin')}
                          />
                        }
                      />
                      <FormControlLabel
                        label="Менеджер"
                        control={
                          <Checkbox
                            checked={values.roles['manager'] || false}
                            onChange={() => handleChangeRole('manager')}
                          />
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormControlLabel
                        label="Дежурный"
                        control={
                          <Checkbox
                            checked={values.roles['duty'] || false}
                            onChange={() => handleChangeRole('duty')}
                          />
                        }
                      />
                      <FormControlLabel
                        label="Диспетчер"
                        control={
                          <Checkbox
                            checked={values.roles['dispatcher'] || false}
                            onChange={() => handleChangeRole('dispatcher')}
                          />
                        }
                      />
                    </FormGroup>
                  </div>
                  {
                    values.roles && values.roles['manager'] && (
                      <div className={styles.autocomplete}>
                        <Autocomplete
                          id="autocomplete2"
                          multiple
                          name="autocomplete2"
                          options={groupsOptions}
                          getOptionLabel={(option) => option.name}
                          value={values.autocomplete2}
                          onChange={(_, newValue) => {
                            handleChange({
                              target: { name: 'autocomplete2', value: newValue },
                            });
                            setNewSelected(newValue)
                          }}
                          onBlur={handleBlur}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Выберите группы для роли менеджера"
                              variant="outlined"
                              fullWidth
                              error={Boolean(errors.autocomplete2)}
                              helperText={errors.autocomplete2}
                            />
                          )}
                        />
                      </div>
                    )
                  }
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                  <Button onClick={() => {
                    setOpen(false)
                    resetForm()
                    setNewSelected([])
                  }} variant="outlined" color="error">
                    Отменить
                  </Button>
                  <Button form="addRolesForm" type="submit" variant="outlined" color="primary" disabled={!isValid || !(newGroups.length || newRoles.length)}>
                    ОК
                  </Button>
                </DialogActions>
              </div>
            </Dialog>
          </Form>
      )}}
    </Formik>
    <AddRolesAgreeModal agreeModal={openAgree} setExit={setOpenAgree} setAgree={() => handleAgree(values)}/>
    </>
  );
};
