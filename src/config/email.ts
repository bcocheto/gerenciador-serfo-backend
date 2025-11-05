// src/config/email.ts
import nodemailer from "nodemailer";
import { AppError } from "../middleware/errorHandler.js";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export class EmailTransporter {
  private static instance: EmailTransporter;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {
    this.initializeTransporter();
  }

  public static getInstance(): EmailTransporter {
    if (!EmailTransporter.instance) {
      EmailTransporter.instance = new EmailTransporter();
    }
    return EmailTransporter.instance;
  }

  private initializeTransporter() {
    try {
      // Configuração baseada em variáveis de ambiente
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER || "",
          pass: process.env.EMAIL_PASS || "",
        },
        from: {
          name: process.env.EMAIL_FROM_NAME || "SERFO",
          email: process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER || "",
        },
      };

      // Validar configurações obrigatórias
      if (!config.auth.user || !config.auth.pass) {
        console.warn(
          "⚠️  Configurações de email não encontradas. Emails não serão enviados."
        );
        return;
      }

      // Configuração para o nodemailer
      const transportConfig = {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        tls: {
          rejectUnauthorized: false, // Para desenvolvimento
        },
      };

      this.transporter = nodemailer.createTransport(transportConfig);

      console.log("📧 Transporter de email configurado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao configurar transporter de email:", error);
      throw new AppError("Erro na configuração de email", 500);
    }
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn("⚠️  Transporter não configurado");
        return false;
      }

      await this.transporter.verify();
      console.log("✅ Conexão de email verificada com sucesso");
      return true;
    } catch (error) {
      console.error("❌ Erro na verificação de email:", error);
      return false;
    }
  }

  public getTransporter(): nodemailer.Transporter | null {
    return this.transporter || null;
  }

  public isConfigured(): boolean {
    return !!this.transporter;
  }

  public getConfig(): EmailConfig {
    return {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
      },
      from: {
        name: process.env.EMAIL_FROM_NAME || "SERFO",
        email: process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER || "",
      },
    };
  }

  public getFromAddress(): string {
    const config = this.getConfig();
    return `"${config.from.name}" <${config.from.email}>`;
  }
}

// Instância singleton
export const emailTransporter = EmailTransporter.getInstance();

// Templates padrão para diferentes tipos de email
export const EMAIL_TEMPLATES = {
  COBRANCA: {
    nome: "Cobrança Mensal",
    assunto: "Contribuição SERFO - Vencimento {{dataVencimento}}",
    corpo: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Contribuição SERFO</h2>
        
        <p>Olá, <strong>{{nome}}</strong>!</p>
        
        <p>Este é um lembrete sobre sua contribuição mensal para a SERFO.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c5530;">Detalhes da Contribuição</h3>
          <p><strong>Valor:</strong> R$ {{valor}}</p>
          <p><strong>Data de Vencimento:</strong> {{dataVencimento}}</p>
          <p><strong>Forma de Pagamento:</strong> {{formaPagamento}}</p>
        </div>
        
        <p>Para efetuar o pagamento, entre em contato conosco através dos canais disponíveis.</p>
        
        <p>Agradecemos sua colaboração!</p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            SERFO - Organização dedicada ao bem-estar social<br>
            Este é um email automático, por favor não responda.
          </p>
        </div>
      </div>
    `,
    tipo: "cobranca",
  },

  LEMBRETE: {
    nome: "Lembrete de Vencimento",
    assunto:
      "Lembrete: Contribuição SERFO vence em {{diasParaVencimento}} dias",
    corpo: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Lembrete de Contribuição</h2>
        
        <p>Olá, <strong>{{nome}}</strong>!</p>
        
        <p>Lembramos que sua contribuição mensal vence em <strong>{{diasParaVencimento}} dias</strong>.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Detalhes da Contribuição</h3>
          <p><strong>Valor:</strong> R$ {{valor}}</p>
          <p><strong>Data de Vencimento:</strong> {{dataVencimento}}</p>
        </div>
        
        <p>Antecipe seu pagamento e ajude a SERFO a continuar seus projetos sociais.</p>
        
        <p>Obrigado!</p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            SERFO - Organização dedicada ao bem-estar social<br>
            Este é um email automático, por favor não responda.
          </p>
        </div>
      </div>
    `,
    tipo: "lembrete",
  },

  AGRADECIMENTO: {
    nome: "Agradecimento por Pagamento",
    assunto: "Pagamento Recebido - Obrigado por sua contribuição!",
    corpo: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Pagamento Confirmado ✅</h2>
        
        <p>Olá, <strong>{{nome}}</strong>!</p>
        
        <p>Confirmamos o recebimento de sua contribuição. Muito obrigado!</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #155724;">Detalhes do Pagamento</h3>
          <p><strong>Valor:</strong> R$ {{valor}}</p>
          <p><strong>Data do Pagamento:</strong> {{dataPagamento}}</p>
          <p><strong>Forma de Pagamento:</strong> {{formaPagamento}}</p>
          {{#notaFiscal}}
          <p><strong>Nota Fiscal:</strong> {{numero}}</p>
          {{/notaFiscal}}
        </div>
        
        <p>Sua contribuição é fundamental para que a SERFO continue impactando vidas positivamente.</p>
        
        <p>Gratidão!</p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            SERFO - Organização dedicada ao bem-estar social<br>
            Este é um email automático, por favor não responda.
          </p>
        </div>
      </div>
    `,
    tipo: "agradecimento",
  },

  BOAS_VINDAS: {
    nome: "Boas-vindas",
    assunto: "Bem-vindo(a) à SERFO!",
    corpo: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Bem-vindo(a) à SERFO! 🎉</h2>
        
        <p>Olá, <strong>{{nome}}</strong>!</p>
        
        <p>É com grande alegria que damos as boas-vindas a você como {{tipo}} da SERFO.</p>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1565c0;">Sobre a SERFO</h3>
          <p>A SERFO é uma organização comprometida com o desenvolvimento social e o bem-estar da comunidade. Juntos, fazemos a diferença!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c5530;">Seus Dados</h3>
          <p><strong>Nome:</strong> {{nome}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          {{#telefone}}
          <p><strong>Telefone:</strong> {{telefone}}</p>
          {{/telefone}}
          {{#valorMensal}}
          <p><strong>Contribuição Mensal:</strong> R$ {{valorMensal}}</p>
          <p><strong>Dia de Vencimento:</strong> {{diaVencimento}}</p>
          {{/valorMensal}}
        </div>
        
        <p>Em caso de dúvidas, entre em contato conosco. Estamos aqui para ajudar!</p>
        
        <p>Obrigado por fazer parte da nossa família!</p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            SERFO - Organização dedicada ao bem-estar social<br>
            Este é um email automático, por favor não responda.
          </p>
        </div>
      </div>
    `,
    tipo: "boas_vindas",
  },
};

// Função para testar a conexão de email
export async function testEmailConnection(): Promise<boolean> {
  return await emailTransporter.verifyConnection();
}
