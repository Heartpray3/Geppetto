import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { RobotCommunicationService } from '@app/services/robot-communication/robot-communication.service';
import { collapseExpandAnimation } from 'src/assets/CollapseExpand';
import { CommonModule } from '@angular/common';

interface MapMetaData {
    width: number;
    height: number;
    resolution: number;
    origin: { x: number; y: number; z: number };
}

interface OccupancyGrid {
    header: {
        stamp: { sec: number; nsec: number };
        frame_id: string;
    };
    info: MapMetaData;
    data: Int8Array;
}

@Component({
    selector: 'app-map-display',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './map-display.component.html',
    styleUrls: ['./map-display.component.scss'],
    animations: [collapseExpandAnimation]
})
export class MapDisplayComponent implements OnInit {
    @ViewChild('mapCanvas', { static: true }) mapCanvas!: ElementRef<HTMLCanvasElement>;
    isCollapsed = false;

    constructor(private robotCommunicationService: RobotCommunicationService) {}

    ngOnInit(): void {
        this.robotCommunicationService.onLiveMap().subscribe((occupancyGrid: OccupancyGrid) => {
            this.drawMap(occupancyGrid);
        });
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }

    drawMap(occupancyGrid: OccupancyGrid): void {
        const canvas = this.mapCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = occupancyGrid.info;
        canvas.width = width;
        canvas.height = height;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const cellValue = occupancyGrid.data[index];
                if (cellValue === -1) {
                    ctx.fillStyle = 'gray';
                }
                else if (cellValue === 0) {
                    ctx.fillStyle = 'white';
                }
                else {
                    ctx.fillStyle = 'black';
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}
