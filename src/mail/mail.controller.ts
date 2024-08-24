import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { Company } from 'src/companies/schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Subcriber,
  SubcriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,

    @InjectModel(Subcriber.name)
    private subcriberModel: SoftDeleteModel<SubcriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  async handleTestEmail() {
    const jobs = [
      {
        name: 'Phong',
        company: 'FUck',
        salary: '5000',
        skills: ['FUck 12312', 'FUck 12312'],
      },
      {
        name: 'Phong',
        company: 'FUck',
        salary: '5000',
        skills: ['FUck 12312', 'FUck 12312'],
      },
      {
        name: 'Phong',
        company: 'FUck',
        salary: '5000',
        skills: ['FUck 12312', 'FUck 12312'],
      },
      {
        name: 'Phong',
        company: 'FUck',
        salary: '5000',
        skills: ['FUck 12312', 'FUck 12312'],
      },
    ];

    const subscribers = await this.subcriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills,
          };
        });
      }
      await this.mailerService.sendMail({
        to: 'hoangphonghp04@gmail.com',
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Nice App! Confirm your Email',
        template: 'new-job',
        context: {
          receiver: subs.name,
          jobs: jobs,
        },
      });
    }
  }
}
