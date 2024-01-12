import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service'; // Replace with the correct path
import { UserService } from '../../services/user.service'; // Replace with the correct path
import { ModalController } from '@ionic/angular';
import { CreateCategoryModalPage } from '../create-category-modal/create-category-modal.page'; // Update the path
import { UpdateCategoryModalPage } from '../update-category-modal/update-category-modal.page'; // Update the path
import { DeleteCategoryModalPage } from '../delete-category-modal/delete-category-modal.page'; // Update the path
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  commerces: any[] = [];
  selectedCommerce: any = null; // Track the selected commerce
  categories: any[] = [];
  selectedCategory: any = null;
  currentCommerce: any; // Replace 'any' with the actual type of your commerce data
  categoryData: any; // You might want to use a more specific type for categoryData
  isCategoryNameModified: boolean = false;
  businessOwnerId: string = '';
  isAppLocked: boolean = false;
  updatedCategories: any[] = [];


  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.checkMonthlyFeePaidStatus();
  }

  async loadCommercesForCurrentUser() {
    try {
      const userEmail = await this.getCurrentLoggedInUserEmail();
      if (userEmail !== null) {
        const businessOwnerId = await this.getBusinessOwnerIdByEmail(userEmail);
        if (businessOwnerId !== null) {
          this.commerces = await this.getAllCommercesByBusinessOwnerId(businessOwnerId);
          if (this.commerces.length > 0) {
            // Select the first commerce and load its categories
            this.selectCommerce(this.commerces[0]);
          }
        } else {
          console.error('Business owner ID not found.');
        }
      } else {
        console.error('User email not found.');
      }
    } catch (error) {
      console.error('Error loading commerces:', error);
    }
  }

  async getCurrentLoggedInUserEmail(): Promise<string | null> {
    const userEmail = await this.userService.getCurrentUserEmail(); // Use userService to get the user's email
    return userEmail;
  }

  async getBusinessOwnerIdByEmail(userEmail: string): Promise<string | null> {
    try {
      const businessOwnerId = await this.categoryService.getBusinessOwnerIdByEmail(userEmail);
      return businessOwnerId;
    } catch (error) {
      console.error('Error fetching business owner ID:', error);
      return null;
    }
  }

  async getAllCommercesByBusinessOwnerId(businessOwnerId: string): Promise<any[]> {
    try {
      const commerces = await this.categoryService.getAllCommercesByBusinessOwnerId(businessOwnerId);
      return commerces;
    } catch (error) {
      console.error('Error fetching commerces:', error);
      return []; // Return an empty array in case of an error
    }
  }

  // Method to select a commerce and load its categories
  async selectCommerce(commerce: any) {

    this.selectedCommerce = commerce;
    this.currentCommerce = commerce;
    this.loadCategoriesByCommerceId(commerce.id);
  }

  async loadCategoriesByCommerceId(commerceId: number) {
    try {
      this.categories = await this.categoryService.getAllCategoriesByCommerceId(commerceId);
    } catch (error) {
      console.error('Error loading categories for commerce:', error);
    }
  }

  async openCreateCategoryModal() {
    const modal = await this.modalController.create({
      component: CreateCategoryModalPage,
      componentProps: {
        commerceName: this.selectedCommerce.commercename,
        categoryData: {
          categoryname: '', // Initialize with default values or leave empty
          ville_id: this.selectedCommerce.ville_id,
          business_owner_id: this.selectedCommerce.business_owner_id,
          commerce_id: this.selectedCommerce.id,
        },
      },
    });

    modal.onDidDismiss().then(async (data) => {
      if (data && data.data === true) {
        // The modal was dismissed with a "true" value, indicating that the category was updated.
  
        
  
        // Update the categories list for the current commerce
        await this.loadCategoriesByCommerceId(this.selectedCommerce.id);
  
  // Set the selected commerce to the first commerce
        this.selectedCommerce = this.commerces[0];
  
        // Manually trigger change detection to refresh the view
        this.cdr.detectChanges();
      }
    });
  
  
  

    return await modal.present();
  }


  async openUpdateCategoryModal() {
    let categoryNameToDisplay = '';

    if (this.selectedCategory && this.selectedCategory.commerce_id === this.selectedCommerce.id) {
      categoryNameToDisplay = this.selectedCategory.categoryname;
    } else if (this.categories.length > 0) {
      // If no category is selected, or if the selected category is from a different commerce, select the first category of the current commerce
      this.selectedCategory = this.categories.find(category => category.commerce_id === this.selectedCommerce.id);
      if (this.selectedCategory) {
        categoryNameToDisplay = this.selectedCategory.categoryname;
      }
    }

    const categoryId = await this.categoryService.getCategoryIdBy(
      this.selectedCategory.categoryname, // Or use categoryNameToDisplay, whichever is appropriate
      this.selectedCommerce.ville_id,
      this.selectedCommerce.business_owner_id,
      this.selectedCommerce.id
    );

    if (categoryId !== null) {
      const modal = await this.modalController.create({
        component: UpdateCategoryModalPage,
        componentProps: {
          categoryData: {
            categoryname: categoryNameToDisplay,
            ville_id: this.selectedCommerce.ville_id,
            business_owner_id: this.selectedCommerce.business_owner_id,
            commerce_id: this.selectedCommerce.id,
          },
          selectedCategory: this.selectedCategory, // Pass the selected category
          categoryId: categoryId, // Pass the categoryId to the modal
        }
      });

      modal.onDidDismiss().then(async (data) => {
        if (data && data.data === true) {
          // The modal was dismissed with a "true" value, indicating that the category was updated.

          // récupérer la catégorie actualisée ici, 
    
          // Load the categories for the current commerce
          await this.loadCategoriesByCommerceId(this.selectedCommerce.id);
    
          // Add the updated category to the updatedCategories array
          this.updatedCategories.push(this.selectedCategory);
    
          // Manually trigger change detection to refresh the view
          this.cdr.detectChanges();
    
          // Route to '/dashboard/categories'
          this.router.navigate(['/dashboard/categories']);
        }
      });

      return await modal.present();
    } else {
      console.error('Category ID not found.');
    }
  }

  async openDeleteCategoryModal() {
    let categoryNameToDisplay = '';

    if (this.selectedCategory && this.selectedCategory.commerce_id === this.selectedCommerce.id) {
      categoryNameToDisplay = this.selectedCategory.categoryname;
    } else if (this.categories.length > 0) {
      // If no category is selected, or if the selected category is from a different commerce, select the first category of the current commerce
      this.selectedCategory = this.categories.find(category => category.commerce_id === this.selectedCommerce.id);
      if (this.selectedCategory) {
        categoryNameToDisplay = this.selectedCategory.categoryname;
      }
    }

    const categoryId = await this.categoryService.getCategoryIdBy(
      categoryNameToDisplay,
      this.selectedCommerce.ville_id,
      this.selectedCommerce.business_owner_id,
      this.selectedCommerce.id
    );

    if (categoryId !== null) {
      const modal = await this.modalController.create({
        component: DeleteCategoryModalPage,
        componentProps: {
          categoryData: {
            categoryname: categoryNameToDisplay,
            ville_id: this.selectedCommerce.ville_id,
            business_owner_id: this.selectedCommerce.business_owner_id,
            commerce_id: this.selectedCommerce.id,
          },
          selectedCategory: this.selectedCategory,
          categoryId: categoryId,
        }
      });

      modal.onDidDismiss().then((data) => {
        if (data && data.data === true) {
          // The modal was dismissed with a "true" value, indicating that the category was updated.
          // You can update your categories list or perform any other necessary actions here.
        }
      });

      return await modal.present();
    } else {
      console.error('Category ID not found.');
    }
  }


  // Implement a method to set the selected category
  setSelectedCategory(category: any) {
    this.selectedCategory = category;
    console.log('la catégorie en cours est : ', this.selectedCategory)
  }

  resetForm() {

  }

  async showCategoryNameUnchangedAlert() {
    const alert = await this.alertController.create({
      header: 'Category Name Unchanged',
      message: 'You have not modified the category name.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async checkMonthlyFeePaidStatus() {
    try {
      // Fetch the current user's email from Ionic Storage
      const currentUserEmail = await this.userService.getCurrentUserEmail();

      if (currentUserEmail) {
        const businessOwners = await this.userService.getBusinessOwnersByCurrentUser(currentUserEmail);

        if (businessOwners.length > 0) {
          this.businessOwnerId = businessOwners[0].id;

          // Fetch the monthly_fee_paid status
          const monthlyFeePaid = await this.userService.getMonthlyFeePaidStatus(this.businessOwnerId);

          if (!monthlyFeePaid) {
            this.lockApp();
            return;
          }
          // Continue loading commerces if the fee is paid
          await this.loadCommercesForCurrentUser();
        } else {
          console.error('No business owner found for the current user email.');
        }
      } else {
        console.error('User email not available.');
      }
    } catch (error) {
      console.error('Error checking monthly fee paid status:', error);
    }
  }

  lockApp() {
    // Disable form controls or redirect to a locked page
    this.isAppLocked = true;
    // Example: Show a locked message or redirect to a locked page
    this.router.navigate(['/villes-commerces']);
  }


}
