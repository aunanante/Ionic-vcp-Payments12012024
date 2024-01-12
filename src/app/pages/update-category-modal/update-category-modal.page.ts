import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router'; // Import the Router

@Component({
  selector: 'app-update-category-modal',
  templateUrl: './update-category-modal.page.html',
  styleUrls: ['./update-category-modal.page.scss'],
})
export class UpdateCategoryModalPage implements OnInit {

  @Input() categoryData: any;
  @Input() categoryId!: number;
  public categoryName!: string;
  isCategoryNameModified: boolean = false;
  // Add an EventEmitter to emit an event when the category is updated
  @Output() categoryUpdated = new EventEmitter<boolean>();


  constructor(
    private modalController: ModalController,
    private categoryService: CategoryService,
    private alertController: AlertController,
    private router: Router
  ) { }

  closeModal() {
    this.modalController.dismiss();
  }

  async updateCategory() {
    try {
      // Check if the category is already present
      const isAlreadyPresent = await this.categoryService.isAlreadyPresent(this.categoryData);

      if (isAlreadyPresent) {
        // Display an alert indicating the category already exists
        this.showCategoryAlreadyExistsAlert();
      } else {
        // Call the updateCategory method of your CategoryService
        const updated = await this.categoryService.updateCategory(this.categoryId, this.categoryData);

        if (updated) {
          // Category was successfully updated
          // You can handle this as needed, for example, showing a success message to the user
          console.log('Category updated successfully.');

          // Emit an event to notify the parent component (CategoriesPage) about the update
          this.categoryUpdated.emit(true);

          // Close the modal after confirming and updating
          this.closeModal();
        } else {
          // Category update failed
          // You can handle this, for example, showing an error message
          console.error('Category update failed. Updated: ' + updated);
          console.log('category data : ', this.categoryData);
          console.log('category Id : ', this.categoryId);
        }
      }
    } catch (error) {
      console.error('Error updating category:', error);
      // You can handle errors here, e.g., show an error message to the user
    }
  }




  async showCategoryAlreadyExistsAlert() {
    const alert = await this.alertController.create({
      header: 'Category Already Exists',
      message: 'The category you are trying to update already exists.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  ngOnInit() {
    this.categoryName = this.categoryData.categoryname;
    console.log('la catégorie en cours est : ', this.categoryName)
  }

}
