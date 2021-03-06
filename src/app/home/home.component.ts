import { Component, OnInit,Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader} from '../shared/leader';
import { LeaderService } from '../services/leader.service';
import { LEADERS } from '../shared/leaders';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  dish!: Dish;
  promotion!: Promotion;
  leader!: Leader;
  dishErrMess: string;
  constructor(private dishservice: DishService,
    private promotionservice: PromotionService,
    private leaderservice: LeaderService,
    @Inject('BaseURL') public BaseURL
    ) { }

  ngOnInit() {
    this.dishservice.getFeaturedDish().subscribe(dishes => this.dish = dishes, errmsg => this.dishErrMess = <any>errmsg);
    this.promotionservice.getFeaturedPromotion().subscribe(promotions => this.promotion = promotions);
    this.leaderservice.getFeaturedLeader().subscribe(LEADERS => this.leader = LEADERS);
  }

}
