import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Plus, LogOut, User } from 'lucide-react';

interface NavBarProps {
  isAuthenticated: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  isAuthenticated,
  userProfile,
  onLogout,
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Tags', path: '/tags' },
  ];

  return (
    <>
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="mb-6 bg-gray-950/80 backdrop-blur-xl border-b border-white/10"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link to="/" className="nav-logo-gradient">Space Blog Platform</Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <Link to="/" className="nav-logo-gradient">Space Blog Platform</Link>
        </NavbarBrand>
        {menuItems.map((item) => (
          <NavbarItem
            key={item.path}
            isActive={location.pathname === item.path}
          >
            <Link
              to={item.path}
              className={`nav-link-plasma ${location.pathname === item.path ? 'nav-link-active' : ''}`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {isAuthenticated ? (
          <>
            <NavbarItem>
              <Button
                as={Link}
                to="/posts/new"
                color="primary"
                className="btn-nebula"
                variant="flat"
                startContent={<Plus size={16} />}
              >
                New Post
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform ring-offset-black ring-2 ring-primary/30"
                    src={userProfile?.avatar}
                    name={userProfile?.name}
                  />
                </DropdownTrigger>
                <DropdownMenu 
                    aria-label="User menu"
                    variant="flat"
                    classNames={{
                        base: "bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-1",
                        list: "gap-1",}}>                
                  <DropdownItem
                    key="profile"
                    startContent={<User size={16} className="text-primary" />}
                    className="data-[hover=true]:bg-white/5 group transition-colors"
                    textValue="Profile"
                  >
                    <Link to="/profile" className="w-full block text-white/80 group-hover:text-white">Profile</Link>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    startContent={<LogOut size={16} />}
                    className="text-danger data-[hover=true]:bg-danger/10 transition-colors"
                    color="danger"
                    onPress={onOpen}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <NavbarItem>
              <Button as={Link} to="/login" variant="light" className="btn-cancel">
                Log In
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} to="/register" color="primary" variant="flat" className="btn-primary">
                Sign Up
              </Button>
            </NavbarItem>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              to={item.path}
              className={`w-full ${
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-default-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {!isAuthenticated && (
          <>
            <NavbarMenuItem>
              <Link to="/login" className="w-full text-default-600" onClick={() => setIsMenuOpen(false)}>
                Log In
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link to="/register" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>

        <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop="blur"
      classNames={{
        base: "bg-[#0B1120] border border-white/10", // Matching your Card theme
        header: "text-white border-b border-white/5",
        body: "text-white/70",
        footer: "border-t border-white/5",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Confirm Logout</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to log out? You will need to sign in again to create new posts or manage your drafts.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                color="danger" 
                variant="flat"
                className="bg-danger/20"
                onPress={() => {
                  onLogout();
                  onClose();
                }}
              >
                Logout
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    </>
  );
};

export default NavBar;