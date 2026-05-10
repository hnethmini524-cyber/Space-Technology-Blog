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
  {/* Mobile: Toggle and Brand */}
  <NavbarContent className="sm:hidden" justify="start">
    <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu" } className="text-cyan-400"/>
  </NavbarContent>

  <NavbarContent className="sm:hidden pr-3" justify="center">
    <NavbarBrand>
      <Link to="/" className="nav-logo-gradient">Nebula Nexus</Link>
    </NavbarBrand>
  </NavbarContent>

  {/* Desktop: Brand and Links */}
  <NavbarContent className="hidden sm:flex gap-8" justify="start">
    <NavbarBrand className="mr-4">
      <Link to="/" className="nav-logo-gradient">Nebula Nexus</Link>
    </NavbarBrand>
    {menuItems.map((item) => (
      <NavbarItem key={item.path} isActive={location.pathname === item.path}>
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
      <div className="flex items-center gap-4">
        <NavbarItem className="hidden sm:flex">
          <Button
            as={Link}
            to="/posts/new"
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
            <DropdownMenu aria-label="User menu" variant="flat" classNames={{
                        base: "bg-gray-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-1",
                        list: "gap-1",}}>
              <DropdownItem key="profile" textValue="Profile" startContent={<User size={16} className="text-primary" />} className="data-[hover=true]:bg-white/5 group transition-colors">
                <Link to="/profile" className="w-full block text-white/80 group-hover:text-white">Profile</Link>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={onOpen} startContent={<LogOut size={16} />} className="text-danger data-[hover=true]:bg-danger/10 transition-colors">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <NavbarItem className="hidden sm:flex">
          <Button as={Link} to="/login" variant="light" className="btn-cancel">
            Log In
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} to="/register" className="btn-primary" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </div>
    )}
  </NavbarContent>

  {/* Mobile menu */}
  <NavbarMenu className="bg-gray-950/90 backdrop-blur-xl pt-6">
    {menuItems.map((item) => (
      <NavbarMenuItem key={item.path}>
        <Link
          to={item.path}
          className={`w-full flex py-2 text-lg ${
            location.pathname === item.path ? 'text-cyan-400 font-bold' : 'text-slate-300'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          {item.name}
        </Link>
      </NavbarMenuItem>
    ))}
    
    {/* Add auth action to mobile menu if not logged in */}
    {!isAuthenticated && (
      <div className="flex flex-col gap-4 mt-4 border-t border-white/10 pt-4">
        <NavbarMenuItem>
          <Link to="/login" className="text-slate-300 text-lg" onClick={() => setIsMenuOpen(false)}>
            Log In
          </Link>
        </NavbarMenuItem>
      </div>
    )}

    {/* Add user specific mobile links */}
    {isAuthenticated && (
      <div className="flex flex-col gap-4 mt-4 border-t border-white/10 pt-4">
        <NavbarMenuItem>
          <Link to="/posts/new" className="text-cyan-400 text-lg flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <Plus size={18} /> New Post
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <button className="text-rose-400 text-lg flex items-center gap-2" onClick={() => { setIsMenuOpen(false); onOpen(); }}>
            <LogOut size={18} /> Log Out
          </button>
        </NavbarMenuItem>
      </div>
    )}
  </NavbarMenu>
</Navbar>

        <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop="blur"
      classNames={{
        base: "bg-[#0B1120] border border-white/10", 
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
                className="bg-danger/20 text-white/40"
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