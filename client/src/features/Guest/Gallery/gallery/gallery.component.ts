import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type GalleryCategory = 'All' | 'Wedding' | 'Birthday' | 'Celebration';

interface GalleryImage {
  id: number;
  type: Exclude<GalleryCategory, 'All'>;
  image: string;
  title: string;
  location: string;
  date: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  readonly categories: GalleryCategory[] = ['All', 'Wedding', 'Birthday', 'Celebration'];

  readonly galleryImages: GalleryImage[] = [
    {
      id: 1,
      type: 'Wedding',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=70',
      title: 'Timeless Vows',
      location: 'Udaipur Palace',
      date: 'Nov 2023'
    },
    {
      id: 2,
      type: 'Wedding',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=70',
      title: 'Sunlit Haldi Rituals',
      location: 'Goa Beachfront',
      date: 'Aug 2023'
    },
    {
      id: 3,
      type: 'Birthday',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70',
      title: 'Neon Birthday Bash',
      location: 'Bengaluru',
      date: 'Jan 2024'
    },
    {
      id: 4,
      type: 'Birthday',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=70',
      title: 'Garden Birthday Brunch',
      location: 'Chennai',
      date: 'Sep 2023'
    },
    {
      id: 5,
      type: 'Celebration',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70',
      title: 'Sunset Get-Together',
      location: 'Pune',
      date: 'Mar 2024'
    },
    {
      id: 6,
      type: 'Celebration',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=70',
      title: 'Elegant Dinner Club',
      location: 'Mumbai',
      date: 'Feb 2024'
    },
    {
      id: 7,
      type: 'Wedding',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=70',
      title: 'Bridal Finery',
      location: 'Delhi',
      date: 'May 2024'
    },
    {
      id: 8,
      type: 'Birthday',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=70',
      title: 'Candlelit Celebration',
      location: 'Bengaluru',
      date: 'Jun 2024'
    },
    {
      id: 9,
      type: 'Celebration',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=70',
      title: 'Family Soiree',
      location: 'Kochi',
      date: 'Jul 2024'
    }
  ];

  selectedCategory: GalleryCategory = 'All';
  activeImage: GalleryImage | null = null;

  get filteredImages(): GalleryImage[] {
    if (this.selectedCategory === 'All') {
      return this.galleryImages;
    }
    return this.galleryImages.filter((img) => img.type === this.selectedCategory);
  }

  setCategory(category: GalleryCategory): void {
    this.selectedCategory = category;
  }

  openLightbox(image: GalleryImage): void {
    this.activeImage = image;
    document.body.classList.add('overflow-hidden');
  }

  closeLightbox(): void {
    this.activeImage = null;
    document.body.classList.remove('overflow-hidden');
  }
}
