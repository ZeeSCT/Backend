import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@ApiTags("Clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "Get all clients" })
  findAll() {
    return this.clientsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: "Create client" })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update client by ID" })
  update(@Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete client" })
  @ApiParam({ name: "id" })
  deleteClient(@Param("id") id: string) {
    return this.clientsService.deleteClient(id);
  }
}
