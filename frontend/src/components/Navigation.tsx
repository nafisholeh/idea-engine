import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExploreIcon from '@mui/icons-material/Explore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';

const pages = [
  { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { name: 'Market Analysis', path: '/market-analysis', icon: <BarChartIcon /> },
  { name: 'Topic Explorer', path: '/topics', icon: <ExploreIcon /> },
  { name: 'Opportunity Finder', path: '/opportunities', icon: <TrendingUpIcon /> },
  { name: 'Text Analysis', path: '/text-analysis', icon: <AnalyticsIcon /> },
  { name: 'Submit Idea', path: '/submit-idea', icon: <AddCircleOutlineIcon /> },
  { name: 'About', path: '/about', icon: <InfoIcon /> }
];

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Idea Engine
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { sm: 'none' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ p: 2 }}>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton
              component={Link}
              to={page.path}
              selected={location.pathname === page.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === page.path ? 'white' : 'text.secondary',
                }}
              >
                {page.icon}
              </ListItemIcon>
              <ListItemText 
                primary={page.name} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === page.path ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LightModeIcon />}
          sx={{ 
            justifyContent: 'flex-start',
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'background.default',
            }
          }}
        >
          Light Mode
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              Idea Engine
            </Typography>

            {/* Mobile logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              Idea Engine
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    mx: 0.5,
                    color: location.pathname === page.path ? 'primary.main' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: location.pathname === page.path ? 600 : 500,
                    position: 'relative',
                    '&::after': location.pathname === page.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30%',
                      height: 3,
                      bgcolor: 'primary.main',
                      borderRadius: 1.5,
                    } : {},
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            {/* Right side icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton sx={{ mr: 1 }}>
                <SearchIcon />
              </IconButton>
              
              <IconButton 
                onClick={handleOpenNotifications}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleCloseNotifications}
                sx={{ mt: 1.5 }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, width: 320 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">
                    You have 4 new notifications
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleCloseNotifications}>
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>New market trend detected</Typography>
                    <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleCloseNotifications}>
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Your analysis is complete</Typography>
                    <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                  <Button size="small" sx={{ fontSize: '0.75rem' }}>View all notifications</Button>
                </Box>
              </Menu>

              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                  <Avatar alt="User" src="/static/images/avatar/1.jpg" sx={{ width: 36, height: 36 }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer - always visible */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              position: 'relative',
              height: 'calc(100vh - 64px)', // Subtract AppBar height
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navigation; 