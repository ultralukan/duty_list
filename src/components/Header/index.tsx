import {useMemo, useRef, useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import cn from 'classnames';

import styles from './styles.module.scss';
import {ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper} from "@mui/material";
import {logout} from "../../slices/auth.ts";
import {useDispatch, useSelector} from "react-redux";
import {Link, Route, useLocation} from "react-router-dom";
import {RootState} from "@reduxjs/toolkit/dist/query/core/apiState";
import {ExitModal} from "../Modal/ExitModal";
import {useGetPhotoQuery} from "../../api/duties.ts";

const path = import.meta.env.MODE === 'production' ? import.meta.env.BASE_URL : ''
export const Header = () => {
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const anchorRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation()

  const username = useSelector((state: RootState) => state.auth.username);

  const {data: photo} = useGetPhotoQuery({ user_id: username }, {skip: !username})

  const imageUrl = useMemo(() => photo && photo.user_id && `data:image/jpeg;base64,${photo.user_id}`, [photo])

  const FIO = useSelector((state: RootState) => state.auth.userInfo.FIO);
  const scopes = useSelector((state: RootState) => state.auth.scopes);

  const handleUserMenuClick = () => {
    setUserMenuOpen(!isUserMenuOpen);
  };

  const handleCloseUserMenu = () => {
    setUserMenuOpen(false);
  };

  const handleMenuClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };
  const [exit, setExit] = useState(false)
  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className={styles.header}>
      <AppBar position="static" className={styles.navbar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <div className={styles.siteInfo}>
            <div className={styles.icon}>
              <img src=""/>
            </div>
            График дежурств
          </div>
          <div className={styles.profile}>
            <IconButton
              color="inherit"
              onClick={handleUserMenuClick}
              ref={anchorRef}
            >
              {
                imageUrl ? <img src={imageUrl} alt="Image" /> : <AccountCircleIcon />
              }
            </IconButton>
            <Popper
              open={isUserMenuOpen}
              anchorEl={isUserMenuOpen ? anchorRef.current : null}
              transition
              disablePortal
              placement="bottom-end"
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom-end' ? 'right top' : 'right bottom',
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseUserMenu}>
                      <MenuList autoFocusItem={isUserMenuOpen} id="menu-list-grow">
                        <MenuItem
                          sx={[
                            {
                              '&:hover': {
                                backgroundColor: '#FFF',
                                cursor: 'default'
                              },

                            },
                          ]}
                        >
                          {FIO}</MenuItem>
                        <MenuItem onClick={() => window.open(`${path}/reference`, '_blank')}>Справка</MenuItem>
                        <MenuItem onClick={() => setExit(true)}>Выход</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
      >
        <List className={styles.menuList} onClick={handleDrawerClose}>
          <Link to={'/groups'}>
            <ListItem className={cn(styles.menuItem, { [styles.activeTab]: location.pathname === '/groups' })}>
              <GroupsIcon/>
              <ListItemText primary="Группы дежурных" />
            </ListItem>
          </Link>
          <Link to={'/schedules'}>
            <ListItem className={cn(styles.menuItem, { [styles.activeTab]: location.pathname === '/schedules' })}>
              <EventNoteIcon/>
              <ListItemText primary="График дежурств" />
            </ListItem>
          </Link>
          <Link to={'/current-duty'}>
            <ListItem className={cn(styles.menuItem, { [styles.activeTab]: location.pathname === '/current-duty' })}>
              <EngineeringIcon/>
              <ListItemText primary="Текущие дежурные" />
            </ListItem>
          </Link>
          {
            scopes.length && scopes.includes('duty') ? (
              <Link to={'/personal-schedule'}>
                <ListItem className={cn(styles.menuItem, { [styles.activeTab]: location.pathname === '/personal-schedule' })}>
                  <ScheduleIcon/>
                  <ListItemText primary="Личный график" />
                </ListItem>
              </Link>
            ) : null
          }
          {
            scopes.length && scopes.includes('admin') ? (
              <Link to={'/admin-panel'}>
                <ListItem className={cn(styles.menuItem, { [styles.activeTab]: location.pathname === '/admin-panel' })}>
                  <AdminPanelSettingsIcon/>
                  <ListItemText primary="Панель админстратора" />
                </ListItem>
              </Link>
            ) : null
          }
        </List>
      </Drawer>
      <ExitModal setExit={setExit} setAgree={handleLogout} agreeModal={exit}/>
    </div>
  );
};
