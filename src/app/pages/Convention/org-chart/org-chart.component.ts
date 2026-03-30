import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as go from 'gojs';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {

  @ViewChild('orgChart', { static: true }) orgChartDiv!: ElementRef;
  public diagram: go.Diagram | null = null;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  codServ: any;
  listService: any;
  columnsSearch: any;
  selectedCodServ: string | null = null;
  serviceDetails: any = null;

  constructor(private http: HttpClient) {}

  private readonly API_URL = environment.urlServer;

  ngOnInit() {
    this.initDiagram();
    this.getLibSoc();
  }

  initDiagram() {
    const make = go.GraphObject.make;
    this.diagram = make(go.Diagram, this.orgChartDiv.nativeElement, {
      initialContentAlignment: go.Spot.Top,
      'undoManager.isEnabled': true,
      layout: make(go.TreeLayout, {
        angle: 0,
        layerSpacing: 50,
        nodeSpacing: 30,
        alignment: go.TreeLayout.AlignmentCenterChildren,
        setsPortSpot: false,
        setsChildPortSpot: false
      }),
      'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
      'animationManager.isEnabled': true,
      click: (e: go.InputEvent) => { // Correct signature for Diagram click
        // Handle background clicks (outside nodes)
        this.hideDetailsPanel();
      }
    });

    this.diagram.nodeTemplate = make(
      go.Node,
      'Auto',
      {
        selectable: true,
        isShadowed: true,
        shadowOffset: new go.Point(4, 4),
        shadowColor: 'rgba(0,0,0,0.2)',
        click: (e: go.InputEvent, obj: go.GraphObject) => {
          if (obj.part instanceof go.Node && obj.part.data) {
            console.log('Node click data:', obj.part.data); // Debug log
            this.onNodeClick({ ...obj.part.data, key: obj.part.data.key || obj.part.data.id || 'defaultKey' });
          }
        }
      },
      make(
        go.Shape,
        'RoundedRectangle',
        new go.Binding('fill', 'level', (level) => level === 1 ? '#ffc107' : '#007bff'),
        new go.Binding('stroke', 'level', (level) => level === 1 ? '#ff9800' : null),
        {
          strokeWidth: 2,
          parameter1: 10
        }
      ),
      make(
        go.Panel,
        'Vertical',
        { padding: 10 },
        make(
          go.TextBlock,
          {
            font: 'bold 14px Noto Sans Arabic, sans-serif',
            stroke: 'white',
            margin: new go.Margin(5, 5, 2, 5),
            textAlign: 'center',
            maxSize: new go.Size(150, NaN),
            wrap: go.TextBlock.WrapFit
          },
          new go.Binding('text', 'name')
        )
      ),
      {
        toolTip: make(
          go.Adornment,
          'Auto',
          make(go.Shape, 'RoundedRectangle', { fill: '#f8f9fa', stroke: '#007bff' }),
          make(go.TextBlock, { margin: 8, font: '12px Noto Sans Arabic, sans-serif' },
            new go.Binding('text', '', (data) => `اسم: ${data.name}\nكود الخدمة: ${data.key}`))
        )
      }
    );

    this.diagram.nodeTemplateMap.add(
      'DetailsPanel',
      make(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        make(
          go.Shape,
          'Rectangle',
          { fill: '#f0f0f0', stroke: '#333', strokeWidth: 1 },
          new go.Binding('desiredSize', '', () => new go.Size(200, 150))
        ),
        make(
          go.Panel,
          'Vertical',
          { padding: 10 },
          make(
            go.TextBlock,
            { font: 'bold 14px Noto Sans Arabic, sans-serif', margin: 5 },
            new go.Binding('text', '', (data) => `تفاصيل الخدمة: ${data.name || 'غير متاح'}`)
          ),
          make(
            go.TextBlock,
            { font: '12px Noto Sans Arabic, sans-serif', margin: 5, wrap: go.TextBlock.WrapFit },
            new go.Binding('text', '', (data) => {
              return data.details && Object.keys(data.details).length > 0
                ? `hello service\nالوصف: ${data.details.description || 'لا يوجد وصف'}\nالكود: ${data.serviceKey || 'غير متاح'}`
                : 'جارٍ التحميل...';
            })
          ),
          make(
            go.TextBlock,
            {
              font: '12px Noto Sans Arabic, sans-serif',
              margin: 5,
              click: () => this.hideDetailsPanel()
            },
            'إغلاق'
          )
        )
      )
    );
  }

  onNodeClick(data: any) {
    this.selectedCodServ = data.key;
    console.log('Selected node data in onNodeClick:', data); // Enhanced debug log

    // Show the panel with initial "loading" state
    this.serviceDetails = null;
    this.showDetailsPanel(data);

    // Fetch service details and update the panel
    this.http.get(`${this.API_URL}Convention/api/service/${this.selectedCodServ}`).subscribe({
      next: (details: any) => {
        this.serviceDetails = details || {};
        this.updateDetailsPanel(data);
      },
      error: (err) => {
        console.error('Error fetching service details:', err);
        this.serviceDetails = { description: 'فشل في جلب التفاصيل' };
        this.updateDetailsPanel(data);
      }
    });
  }

  showDetailsPanel(nodeData: any) {
    if (!this.diagram) return;

    const make = go.GraphObject.make;
    // Remove any existing details panel
    this.diagram.nodes.each(node => {
      if (node.category === 'DetailsPanel' && this.diagram) {
        this.diagram.remove(node);
      }
    });

    // Add a new details panel with initial data
    this.diagram.add(
      make(go.Node, 'Auto', {
        location: new go.Point(nodeData.loc.x + 50, nodeData.loc.y + 50),
        category: 'DetailsPanel',
        name: nodeData.name || 'غير متاح',
        serviceKey: nodeData.key || `defaultKey_${Date.now()}`, // Use timestamp-based fallback
        details: this.serviceDetails || {}
      },
      make(go.Shape, 'Rectangle', {
        fill: '#f0f0f0',
        stroke: '#333',
        strokeWidth: 1
      }),
      make(go.Panel, 'Vertical', { padding: 10 },
        make(go.TextBlock, {
          font: 'bold 14px Noto Sans Arabic, sans-serif',
          margin: 5
        }, new go.Binding('text', '', (data) => `تفاصيل الخدمة: ${data.name || 'غير متاح'}`)),
        make(go.TextBlock, {
          font: '12px Noto Sans Arabic, sans-serif',
          margin: 5,
          wrap: go.TextBlock.WrapFit
        }, new go.Binding('text', '', (data) => {
          return data.details && Object.keys(data.details).length > 0
            ? `hello service\nالوصف: ${data.details.description || 'لا يوجد وصف'}\nالكود: ${data.serviceKey || 'غير متاح'}`
            : 'جارٍ التحميل...';
        })),
        make(go.TextBlock, {
          font: '12px Noto Sans Arabic, sans-serif',
          margin: 5,
          click: () => this.hideDetailsPanel()
        }, 'إغلاق')
      )
    ));
  }

  updateDetailsPanel(nodeData: any) {
    if (!this.diagram) return;

    // Update the details panel
    this.diagram.nodes.each(node => {
      if (node.category === 'DetailsPanel' && this.diagram) {
        this.diagram.model.setDataProperty(node.data, 'details', this.serviceDetails || {});
      }
    });
  }

  hideDetailsPanel() {
    if (!this.diagram) return;
    this.diagram.nodes.each(node => {
      if (node.category === 'DetailsPanel' && this.diagram) {
        this.diagram.remove(node);
      }
    });
    this.serviceDetails = null;
  }

  zoomToNode(data: any) {
    if (!this.diagram) return;

    const node = this.diagram.findNodeForData(data);
    if (node) {
      this.diagram.scale = 1;
      this.diagram.centerRect(node.actualBounds);
    }
  }

  loadOrgChart(soc: any) {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.http.get(this.API_URL + 'Convention/api/orgchart/' + soc).subscribe({
      next: (data: any) => {
        console.log('Backend response:', data); // Debug log
        this.updateDiagram(data);
        this.loading = false;
        this.successMessage = 'تم تحميل الهيكل التنظيمي بنجاح!';
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.loading = false;
        this.errorMessage = typeof err.error === 'string' ? err.error : 'فشل تحميل الهيكل التنظيمي';
      }
    });
  }

  getLibSoc() {
    this.http.get(this.API_URL + 'Convention/api/getLibSoc').subscribe((data: any) => {
      this.listService = data;
      this.columnsSearch = [
        { key: "cod_soc", label: "Code Societe" },
        { key: "lib_soc", label: "Libelle" },
      ];
    });
  }

  onSelectedValue(item: any) {
    this.codServ = item.cod_soc;
    this.loadOrgChart(item.cod_soc);
  }

  updateDiagram(data: any[]) {
    if (!this.diagram) return;

    console.log('Diagram data before mapping:', data); // Debug log
    const nodeDataArray = data.map(node => ({
      key: node.id || `fallback_${Date.now()}`, // Ensure key is always present
      name: node.name,
      parent: node.parentId || undefined,
      level: node.level,
      loc: new go.Point(0, 0)
    }));
    console.log('Node data array:', nodeDataArray); // Debug log

    this.diagram.model = new go.TreeModel(nodeDataArray);
    this.diagram.commandHandler.zoomToFit();
  }
}