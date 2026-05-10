import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,TableCell,useDisclosure,Modal,ModalContent,ModalHeader,ModalBody,ModalFooter,Tooltip,} from "@nextui-org/react";
import { Plus, Trash2 } from "lucide-react";
import { apiService, Category } from "../services/apiService";

interface CategoriesPageProps {
  isAuthenticated: boolean;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ isAuthenticated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
      setError(null);
    } catch (err) {
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsSubmitting(true);
      await apiService.createCategory(newCategoryName.trim());
      await fetchCategories();
      handleModalClose();
    } catch (err) {
      setError("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteCategory(category.id);
      await fetchCategories();
    } catch (err) {
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setNewCategoryName("");
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="starfield" />
      <Card className="bg-[#0b1121]/50 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-md rounded-2xl p-6">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white/40">Categories</h1>
          {isAuthenticated && (
            <Button
              className= "btn-primary"
              startContent={<Plus size={16} />}
              onClick={onOpen}
            >
              Add Category
            </Button>
          )}
        </CardHeader>

        <CardBody>
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <Table
            aria-label="Categories table"
            removeWrapper
            classNames={{
              base: "bg-transparent",
              table: "bg-transparent",
              thead: "space-table-header", 
            }}
          >
            <TableHeader className="space-table-header">
              <TableColumn>NAME</TableColumn>
              <TableColumn>POST COUNT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              className="text-slate-200"
              loadingContent={<div>Loading categories...</div>}
            >
              {categories.map((category) => (
                <TableRow key={category.id} className="space-table-row">
                  <TableCell className="space-table-cell">{category.name}</TableCell>
                  <TableCell className="space-table-cell">{category.postCount || 0}</TableCell>
                  <TableCell>
                    {isAuthenticated ? (
                      <div className="flex gap-2">
                        <Tooltip
                          content={
                            category.postCount
                              ? "Cannot delete category with existing posts"
                              : "Delete category"
                          }
                        >
                          <Button
                            isIconOnly
                            variant="flat"
                            color="danger"
                            className="btn-action-delete"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            isDisabled={
                              category?.postCount
                                ? category.postCount > 0
                                : false
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onClose={handleModalClose}
        classNames={{
        base: "bg-[#0b1121] border border-white/10 text-white",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",}}
      >
        <ModalContent>
          <ModalHeader>
            Add Category
          </ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              className="modal-input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={handleModalClose} className="btn-cancel">
              Cancel
            </Button>
            <Button
              className="btn-primary"
              onClick={handleAdd}
              isLoading={isSubmitting}
            >
              Add Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
