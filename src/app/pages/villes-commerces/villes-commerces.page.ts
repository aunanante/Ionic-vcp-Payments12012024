import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommerceService } from 'src/app/services/commerce.service';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-villes-commerces',
  templateUrl: './villes-commerces.page.html',
  styleUrls: ['./villes-commerces.page.scss'],
})
export class VillesCommercesPage implements OnInit {

  commerces: any[] = [];
  commerceName: string = '';
  selectedVille: number | null = null;
  villes: any[] = [];
  villeSearchTerm: string = ''; 
  serviceNameSearchTerm: string = '';
  serviceName: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private commerceService: CommerceService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // Fetch all villes for the select dropdown and initialize the component
    this.fetchVillesAndCommerces();
  }
 
  async fetchVillesAndCommerces() {
    try {
      // Fetch all villes for the select dropdown
      this.villes = await this.commerceService.getAllVilles();
      
      // Fetch commerces based on villes
      this.fetchCommerces();
    } catch (error) {
      console.error('Error fetching villes or commerces:', error);
    }
  }
  
  async fetchCommerces() {
    // Modify the method to use both commerceName and serviceNameSearchTerm
    this.commerces = await this.commerceService.getFilteredCommercesForBusinessOwnersWithMonthlyFeePaid(
      this.commerceName, 
      this.selectedVille, 
      this.serviceNameSearchTerm
    );
  }

  async applyFilters() {
    // Fetch filtered commerces based on the provided criteria
    this.commerces = await this.commerceService.getFilteredCommercesForBusinessOwnersWithMonthlyFeePaid(
      this.commerceName, 
      this.selectedVille, 
      this.serviceNameSearchTerm
    );
  }
 
  async applyServiceNameFilter() {
    this.commerces = await this.commerceService.findCommercesByServiceNameWithMonthlyFeePaid(this.serviceName);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  openCommerceCategoriesPage(commerceId: number) {
    // Navigate to CommerceCategoriesPage with the current commerceId
    this.router.navigate(['/commerce-categories', commerceId]);
  }  

  clearVilleFilter() {
    // Clear the selected ville
    this.selectedVille = null;
    this.fetchCommerces();
  }

  ionViewWillEnter() {
    // Fetch updated villes and commerces before the view enters
    this.fetchVillesAndCommerces();
  }

}
